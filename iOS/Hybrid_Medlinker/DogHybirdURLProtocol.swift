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
        
//        if NSURLProtocol.propertyForKey("hasInitKey", inRequest: request) != nil {
//            return false
//        }
//        print(request.URL?.absoluteString)
//        if DogHybirdURLProtocol.res.isEmpty {
//            DogHybirdURLProtocol.initData()
//        }
//        var flag = false
//        dispatch_async(dispatch_get_main_queue()) {
//            if let url = request.URL?.absoluteString {
//                if url.hasPrefix(webAppBaseUrl) {
//                    if let url = request.URL?.absoluteString {
//                        let str = url.stringByReplacingOccurrencesOfString(webAppBaseUrl, withString: "")
//                        
//                        let tempArray = str.componentsSeparatedByString(".")
//                        if tempArray.count == 2 {
//                            let path = MLWebView().LocalResources + tempArray[0]
//                            let type = tempArray[1]
//                            if let _ = NSBundle.mainBundle().pathForResource(path, ofType: type) {
//
//                                flag = true
//                            }
//                        }
//                    }
//                }
//            }
//        }
        if let url = request.URL?.absoluteString {
            print(url)
            if url.hasPrefix(webAppBaseUrl) {
                let str = url.stringByReplacingOccurrencesOfString(webAppBaseUrl, withString: "")
                var tempArray = str.componentsSeparatedByString("?")
                tempArray = tempArray[0].componentsSeparatedByString(".")
                
                if tempArray.count == 2 {
                    let path = MLWebView().LocalResources + tempArray[0]
                    let type = tempArray[1]
                    if let localUrl = NSBundle.mainBundle().pathForResource(path, ofType: type) {
                        print("文件存在 localUrl == \(localUrl)")
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
                            
                            print("文件存在")
                            print("path == \(path)")
                            print("type == \(type)")
                            
                            
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
                            print(typeString)
                            
                            let fileData = NSData(contentsOfFile: localUrl)
                            
                            let url = NSURL(fileURLWithPath: localUrl)
                            
                            //                                let response = NSHTTPURLResponse(URL: url, statusCode: 200, HTTPVersion: "HTTP/1.1", headerFields: headers)
                            let dataLength = fileData?.length ?? 0
                            
                            print("dataLength == \(dataLength)")
                            
                            let response = NSURLResponse(URL: url, MIMEType: typeString, expectedContentLength: dataLength, textEncodingName: "UTF-8")
                            print("response.MIMEType == \(response.MIMEType)")
                            
                            client.URLProtocol(self, didReceiveResponse: response, cacheStoragePolicy: .NotAllowed)
                            client.URLProtocol(self, didLoadData: fileData!)
                            client.URLProtocolDidFinishLoading(self)
                            
                        }
                        else {
                            //
                            print("没找到额")
                            
                        }
                    }
                }
            }
        }
        
    }
    
    override func stopLoading() {
        
    }

    
//    func cachedResponseForCurrentRequest() -> NSCachedURLResponse {
//
//        let delegate = UIApplication.sharedApplication().delegate as! AppDelegate
//        let context = delegate.
//        NSManagedObjectContext
//        return nil
//    }
//    - (CachedURLResponse *)cachedResponseForCurrentRequest {
//    // 1.
//    AppDelegate *delegate = [[UIApplication sharedApplication] delegate];
//    NSManagedObjectContext *context = delegate.managedObjectContext;
//    
//    // 2.
//    NSFetchRequest *fetchRequest = [[NSFetchRequest alloc] init];
//    NSEntityDescription *entity = [NSEntityDescription entityForName:@"CachedURLResponse"
//    inManagedObjectContext:context];
//    [fetchRequest setEntity:entity];
//    
//    // 3.
//    NSPredicate *predicate = [NSPredicate predicateWithFormat:@"url == %@", self.request.URL.absoluteString];
//    [fetchRequest setPredicate:predicate];
//    
//    // 4.
//    NSError *error;
//    NSArray *result = [context executeFetchRequest:fetchRequest error:&error];
//    
//    // 5.
//    if (result && result.count > 0) {
//    return result[0];
//    }
//    
//    return nil;
//    }
}
