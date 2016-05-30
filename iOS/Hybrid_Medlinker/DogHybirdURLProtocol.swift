//
//  DogHybirdURLProtocol.swift
//  Hybrid_Medlinker
//
//  Created by caiyang on 16/5/30.
//  Copyright © 2016年 caiyang. All rights reserved.
//

import UIKit

class DogHybirdURLProtocol: NSURLProtocol {
    override class func canInitWithRequest(request: NSURLRequest) -> Bool {
        let validContentTypes = NSSet(array: ["image/png","image/jpg","image/jpeg"])
        if let contentType = request.allHTTPHeaderFields?["Content-Type"] {
            return validContentTypes.containsObject(contentType)
        }
        return false
    }

    override class func canonicalRequestForRequest(request: NSURLRequest) -> NSURLRequest {
        return request
    }

    override func startLoading() {
        let client: NSURLProtocolClient = self.client!
        let request = self.request
        let headers = [ "Content-Type": "image/jpeg" ]
        let imageData = UIImageJPEGRepresentation(UIImage(named: "loadding_ellipse1")!, 1.0)
        let response = NSHTTPURLResponse(URL: request.URL!, statusCode: 200, HTTPVersion: "HTTP/1.1", headerFields: headers)
        
        client.URLProtocol(self, didReceiveResponse: response!, cacheStoragePolicy: .NotAllowed)
        client.URLProtocol(self, didLoadData: imageData!)
        client.URLProtocolDidFinishLoading(self)
    }
    
    override func stopLoading() {
        
    }

}
