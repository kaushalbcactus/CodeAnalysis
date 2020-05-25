import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef, MessageService } from 'primeng';
import { GlobalService } from 'src/app/Services/global.service';
import { SPOperationService } from 'src/app/Services/spoperation.service';

@Component({
  selector: 'app-file-upload-progress-dialog',
  templateUrl: './file-upload-progress-dialog.component.html',
  styleUrls: ['./file-upload-progress-dialog.component.css']
})
export class FileUploadProgressDialogComponent implements OnInit {

  filedisplayArray = []
  Files: any;
  size = 0;
  unit = "";
  promises = [];
  overwrite: any;
  constructor(
    public config: DynamicDialogConfig,
    public dialogref: DynamicDialogRef,
    public globalService: GlobalService,
    public spoperationService: SPOperationService,
    public messageService: MessageService
  ) { }

  ngOnInit() {

    this.Files = this.config.data.Files;
    this.overwrite = this.config.data.overwrite;
    this.uploadFiles();
  }

  async uploadFiles() {
    let Fileuploadcount = 0;
    let uploadedFiles =[];
    const fSExt = new Array('Bytes', 'KB', 'MB', 'GB');
    for (let index = 0; index < this.Files.length; index++) {

      const size = this.Files[index].file.size;

      if (size < 1000) {
        this.size = size;
        this.unit = "Bytes";
      } else if (size < 1000 * 1000) {
        this.size = size / 1000;
        this.unit = "KB";
      } else if (size < 1000 * 1000 * 1000) {
        this.size = size / 1000 / 1000;
        this.unit = "MB";
      } else {
        this.size = size / 1000 / 1000 / 1000;
        this.unit = "GB";
      }
      this.filedisplayArray.push(new Object({
        fileName: this.Files[index].name,
        percentage: 0,
        size: this.size.toFixed(2) + " " + this.unit,
      }));
      this.fileUpload(this.Files[index].file, this.config.data.libraryName, this.Files[index].name, this.overwrite).then(uploadedFile => {
        Fileuploadcount++;
        

        uploadedFiles.push(uploadedFile)

        if (Fileuploadcount === this.Files.length) {
           this.dialogref.close(uploadedFiles);
        }
      }).catch(error => {
        console.log("Error while uploading" + error)
         this.dialogref.close(uploadedFiles);
      });
    }
  }


  fileUpload(file: any, documentLibrary: string, fileName: string, overwriteValue:boolean) {
    return new Promise((resolve, reject) => {
      this.createDummyFile(fileName, documentLibrary, overwriteValue).then(result => {
        let fr = new FileReader();
        let offset = 0;
        // the total file size in bytes...    
        let total = file.size;
        // 1MB Chunks as represented in bytes (if the file is less than a MB, seperate it into two chunks of 80% and 20% the size)...    
        let length = 1000000 > total ? Math.round(total * 0.8) : 1000000
        let chunks = [];
        //reads in the file using the fileReader HTML5 API (as an ArrayBuffer) - readAsBinaryString is not available in IE!    
        fr.readAsArrayBuffer(file);
        fr.onload = (evt: any) => {
          while (offset < total) {
            //if we are dealing with the final chunk, we need to know...    
            if (offset + length > total) {
              length = total - offset;
            }
            //work out the chunks that need to be processed and the associated REST method (start, continue or finish)    
            chunks.push({
              offset,
              length,
              method: this.getUploadMethod(offset, length, total)
            });
            offset += length;
          }
          //each chunk is worth a percentage of the total size of the file...    
          const chunkPercentage = (total / chunks.length) / total * 100;
          if (chunks.length > 0) {
            //the unique guid identifier to be used throughout the upload session    

            const id = this.generateGUID();
            //Start the upload - send the data to S    
            this.uploadFile(evt.target.result, id, documentLibrary, fileName, chunks, 0, 0, chunkPercentage, resolve, reject);
          }
        };
      })
    })

  }

  createDummyFile(fileName, libraryName, overwriteValue) {
    return new Promise((resolve, reject) => {

      // Construct the endpoint - The GetList method is available for SharePoint Online only.    
      var serverRelativeUrlToFolder = "decodedurl='" + libraryName + "'";
      var endpoint = this.globalService.sharePointPageObject.webRelativeUrl + "/_api/Web/GetFolderByServerRelativePath(" + serverRelativeUrlToFolder + ")/files" + "/add(overwrite=" + overwriteValue + ", url='" + fileName + "')?$expand=ListItemAllFields"

      
      this.spoperationService.executePostForFileUpload(endpoint, this.convertDataBinaryString(2), '').then(file => resolve(true)).catch(err => reject(err));
    });
  }
  // Base64 - this method converts the blob arrayBuffer into a binary string to send in the REST request    
  convertDataBinaryString(data) {
    let fileData = '';
    let byteArray = new Uint8Array(data);
    for (var i = 0; i < byteArray.byteLength; i++) {
      fileData += String.fromCharCode(byteArray[i]);
    }
    return fileData;
  }
  //this method sets up the REST request and then sends the chunk of file along with the unique indentifier (uploadId)    
  uploadFileChunk(id, libraryPath, fileName, chunk, data, byteOffset) {
    return new Promise((resolve, reject) => {
      let offset = chunk.offset === 0 ? '' : ',fileOffset=' + chunk.offset;
      //parameterising the components of this endpoint avoids the max url length problem in SP (Querystring parameters are not included in this length)    
      let endpoint = this.globalService.sharePointPageObject.webRelativeUrl + "/_api/web/getfilebyserverrelativeurl('"+ libraryPath + "/" + fileName + "')/" + chunk.method + "(uploadId=guid'" + id + "'" + offset + ")?$expand=ListItemAllFields";

      const headers = {
        "Accept": "application/json; odata=verbose",
        "Content-Type": "application/octet-stream"
      };
      this.spoperationService.executePostForFileUpload(endpoint, data, headers).then(offset => resolve(offset)).catch(err => reject(err));
    });
  }
  //the primary method that resursively calls to get the chunks and upload them to the library (to make the complete file)    
  uploadFile(result, id, libraryPath, fileName, chunks, index, byteOffset, chunkPercentage, resolve, reject) {
    //we slice the file blob into the chunk we need to send in this request (byteOffset tells us the start position)    
    const data = this.convertFileToBlobChunks(result, chunks[index]);
    //upload the chunk to the server using REST, using the unique upload guid as the identifier    
    this.uploadFileChunk(id, libraryPath, fileName, chunks[index], data, byteOffset).then(value => {
      const isFinished = index === chunks.length - 1;
      index += 1;
      const percentageComplete = isFinished ? 100 : Math.round((index * chunkPercentage));
      this.filedisplayArray.find(c => c.fileName === fileName).percentage = percentageComplete;
      //More chunks to process before the file is finished, continue    
      if (index < chunks.length) {
        this.uploadFile(result, id, libraryPath, fileName, chunks, index, byteOffset, chunkPercentage, resolve, reject);
      } else {
        resolve(value);
      }
    }).catch(err => {
      console.log('Error in uploadFileChunk! ' + err);
      reject(err);
    });
  }
  //Helper method - depending on what chunk of data we are dealing with, we need to use the correct REST method...    
  getUploadMethod(offset, length, total) {
    if (offset + length + 1 > total) {
      return 'finishupload';
    } else if (offset === 0) {
      return 'startupload';
    } else if (offset < total) {
      return 'continueupload';
    }
    return null;
  }
  //this method slices the blob array buffer to the appropriate chunk and then calls off to get the BinaryString of that chunk    
  convertFileToBlobChunks(result, chunkInfo) {
    return result.slice(chunkInfo.offset, chunkInfo.offset + chunkInfo.length);
  }
  generateGUID() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
}

