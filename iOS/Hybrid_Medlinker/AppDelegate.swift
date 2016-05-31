//
//  AppDelegate.swift
//  Hybrid_Medlinker
//
//  Created by caiyang on 16/5/12.
//  Copyright © 2016年 caiyang. All rights reserved.
//

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) -> Bool {
        NSURLProtocol.registerClass(DogHybirdURLProtocol)
        return true
    }

    func application(application: UIApplication, handleOpenURL url: NSURL) -> Bool {
//        return self.shareManager.handleOpenURL(url)
        return true

    }
    
    func application(application: UIApplication, openURL url: NSURL, sourceApplication: String?, annotation: AnyObject) -> Bool {
        
//        if url.host == "safepay" {
//            //跳转支付宝钱包进行支付，处理支付结果
//            AlipaySDK.defaultService().processOrderWithPaymentResult(url, standbyCallback: { (resultDic) in
//                DebugLog(resultDic)
//            })
//            return true
//        }
//        else {
//            if MLOpenUrlHandler.handleOpenURL(url) {
//                return true
//            }
//            
//            return self.shareManager.handleOpenURL(url)
//        }
        let vc = ViewController()
        vc.pageControl(url.absoluteString)

        return true
    }

}

