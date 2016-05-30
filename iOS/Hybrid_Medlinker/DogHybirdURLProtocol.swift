//
//  DogHybirdURLProtocol.swift
//  Hybrid_Medlinker
//
//  Created by caiyang on 16/5/30.
//  Copyright © 2016年 caiyang. All rights reserved.
//

import UIKit
let webAppBaseUrl = "http://kuai.baidu.com/webapp"

class DogHybirdURLProtocol: NSURLProtocol {
    
    var filePath = ""
    var fileType = ""
    
    override class func canInitWithRequest(request: NSURLRequest) -> Bool {
        
//        if NSURLProtocol.propertyForKey("hasInitKey", inRequest: request) != nil {
//            return false
//        }
//        print(request.URL?.absoluteString)
        return true
    }

    override class func canonicalRequestForRequest(request: NSURLRequest) -> NSURLRequest {
        return request
    }

    override func startLoading() {
        dispatch_async(dispatch_get_main_queue()) {
            if let url = self.request.URL?.absoluteString {
                if url.hasPrefix(webAppBaseUrl) {
                    if let url = self.request.URL?.absoluteString {
                        let str = url.stringByReplacingOccurrencesOfString(webAppBaseUrl, withString: "")
                        
                        let tempArray = str.componentsSeparatedByString(".")
                        if tempArray.count == 2 {
                            let path = MLWebView().LocalResources + tempArray[0]
                            let type = tempArray[1]
                            if let localUrl = NSBundle.mainBundle().pathForResource(path, ofType: type) {
                                print("文件存在")
                                print("path == \(path)")
                                print("type == \(type)")

                                let client: NSURLProtocolClient = self.client!
//                                let request = self.request
                                //                            let headers = [ "Content-Type": "image/jpeg" ]
//                                let headers = request.allHTTPHeaderFields
                                
                                var typeString = ""
                                switch type {
                                case "html":
                                       typeString = "text/html"
                                    break
                                case "js":
                                    typeString = "application/x-javascript"
                                    break
                                case "css":
                                    typeString = "text/css"
                                    break
                                default:
                                    break
                                }
                                
                                
                                let headers = ["Content-Type": typeString]
//                                NSDictionary *headers = @{ @"Content-Type": @"image/jpeg" };

                                //                            let imageData = UIImageJPEGRepresentation(UIImage(named: "loadding_ellipse1")!, 1.0)
                                
                                let fileData = NSData(contentsOfFile: localUrl)
                                
                                let url = NSURL(fileURLWithPath: localUrl)
                                
                                let response = NSHTTPURLResponse(URL: url, statusCode: 200, HTTPVersion: "HTTP/1.1", headerFields: headers)
                                print(response)
                                client.URLProtocol(self, didReceiveResponse: response!, cacheStoragePolicy: .NotAllowed)
                                client.URLProtocol(self, didLoadData: fileData!)
                                client.URLProtocolDidFinishLoading(self)

                                
                            }
                            else {
//                                print("文件不存在")
                                
                            }

                            
                        }
                    }
                    
                }
            }
        }

        

        

        
    }
    
    override func stopLoading() {
        
    }

}
