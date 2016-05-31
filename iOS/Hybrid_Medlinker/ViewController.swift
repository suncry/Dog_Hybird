//
//  ViewController.swift
//  Hybrid_Medlinker
//
//  Created by caiyang on 16/5/12.
//  Copyright © 2016年 caiyang. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    @IBOutlet weak var hybirdUrlTextField: UITextField!
    @IBAction func buttonClick(sender: AnyObject) {

        self.pageControl(self.hybirdUrlTextField.text)
        
//        let web = MLWebViewController()
//        web.hidesBottomBarWhenPushed = true
//        web.URLPath = "http://kuai.baidu.com/webapp/demo/index.html"
//        self.navigationController?.pushViewController(web, animated: true)
    }

    @IBAction func localPageClick(sender: AnyObject) {
        self.hybirdUrlTextField.text = "hybrid://forward?param=%7B%22topage%22%3A%22index2%22%2C%22type%22%3A%22native%22%2C%22navigateion%22%3A%22none%22%7D"
    }
    override func viewDidAppear(animated: Bool) {
        self.hybirdUrlTextField.text = "hybrid://forward?param=%7B%22topage%22%3A%22http%3A%2F%2Fkuai.baidu.com%2Fwebapp%2Fdemo%2Findex.html%22%2C%22type%22%3A%22h5%22%7D"

        self.navigationController?.setNavigationBarHidden(false, animated: true)
    }
    
    func pageControl(url: String?) {
        let requestStr = url ?? ""
        if requestStr.hasPrefix("hybrid://") {
            let dataString = requestStr.stringByReplacingOccurrencesOfString("hybrid://", withString: "")
            let dataArray = dataString.componentsSeparatedByString("?")
            let function: String = dataArray[0] ?? ""
            
            let paramString = dataString.stringByReplacingOccurrencesOfString(dataArray[0] + "?", withString: "")
            let paramArray = paramString.componentsSeparatedByString("&")
            
            var paramDic: Dictionary = ["": ""]
            for str in paramArray {
                let tempArray = str.componentsSeparatedByString("=")
                if tempArray.count > 1 {
                    paramDic.updateValue(tempArray[1], forKey: tempArray[0])
                }
            }
            let webView = MLWebView()
            webView.delegate = self
            let args = webView.decodeJsonStr(webView.decodeUrl(paramDic["param"] ?? ""))
            let callBackId = paramDic["callback"] ?? ""
            webView.handleEvent(function, args: args, callbackID: callBackId)
        }
    }
}

