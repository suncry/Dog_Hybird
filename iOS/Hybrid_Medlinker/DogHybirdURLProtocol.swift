//
//  DogHybirdURLProtocol.swift
//  Hybrid_Medlinker
//
//  Created by caiyang on 16/5/30.
//  Copyright © 2016年 caiyang. All rights reserved.
//

import UIKit
import Foundation

let webAppBaseUrl = "http://kuai.baidu.com/webapp"

class DogHybirdURLProtocol: NSURLProtocol {

    override class func canInitWithRequest(request: NSURLRequest) -> Bool {
        if let url = request.URL?.absoluteString {
            if url.hasPrefix(webAppBaseUrl) {
                let str = url.stringByReplacingOccurrencesOfString(webAppBaseUrl, withString: "")
                var tempArray = str.componentsSeparatedByString("?")
                tempArray = tempArray[0].componentsSeparatedByString(".")
                if tempArray.count == 2 {
                    let path = MLWebView().LocalResources + tempArray[0]
                    let type = tempArray[1]
                    if let _ = NSBundle.mainBundle().pathForResource(path, ofType: type) {
                        print("文件存在")
                        print("path == \(path)")
                        print("type == \(type)")
                        return true
                    }
                }
            }
        }
        return false
    }

    override class func canonicalRequestForRequest(request: NSURLRequest) -> NSURLRequest {
        return request
    }

    override func startLoading() {
        dispatch_async(dispatch_get_main_queue()) {
            if let url = self.request.URL?.absoluteString {
                if url.hasPrefix(webAppBaseUrl) {
                    let str = url.stringByReplacingOccurrencesOfString(webAppBaseUrl, withString: "")
                    var tempArray = str.componentsSeparatedByString("?")
                    tempArray = tempArray[0].componentsSeparatedByString(".")
                    if tempArray.count == 2 {
                        let path = MLWebView().LocalResources + tempArray[0]
                        let type = tempArray[1]
                        let client: NSURLProtocolClient = self.client!
                        if let localUrl = NSBundle.mainBundle().pathForResource(path, ofType: type) {
                            var typeString = ""
                            switch type {
                            case "html":
                                typeString = "text/html"
                                break
                            case "js":
                                typeString = "application/javascript"
                                break
                            case "css":
                                typeString = "text/css"
                                break
                            default:
                                break
                            }
                            let fileData = NSData(contentsOfFile: localUrl)
                            let url = NSURL(fileURLWithPath: localUrl)
                            let dataLength = fileData?.length ?? 0
                            let response = NSURLResponse(URL: url, MIMEType: typeString, expectedContentLength: dataLength, textEncodingName: "UTF-8")
                            client.URLProtocol(self, didReceiveResponse: response, cacheStoragePolicy: .NotAllowed)
                            client.URLProtocol(self, didLoadData: fileData!)
                            client.URLProtocolDidFinishLoading(self)
                        }
                        else {
                            print(">>>>> 没找到额 <<<<<")
                        }
                    }
                }
            }
        }
    }
    
    override func stopLoading() {
        
    }

}
