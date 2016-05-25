//
//  MLWebViewController.swift
//  MedLinker
//
//  Created by 蔡杨
//  Copyright © 2015年 MedLinker. All rights reserved.
//

import UIKit


class MLWebViewController: UIViewController {

    var URLPath: String?
    var HTMLString: String?
    var originNaviHidden: Bool?
    var originTabBarHidden: Bool?
    var viewInitY: CGFloat = 0
    
    private var webView: MLWebView!
    
    
    /**************************************************/
    //MARK: - life cycle
    
    override func viewDidLoad() {
        
        super.viewDidLoad()
        self.hidesBottomBarWhenPushed = true
        
        
        self.webView = MLWebView(frame: CGRectMake(0, viewInitY, self.view.bounds.size.width, self.view.bounds.height - viewInitY))
        self.webView.autoresizingMask = [ .FlexibleHeight, .FlexibleWidth ]
        self.webView.delegate = self
        self.view.addSubview(self.webView)
        
        if let path = self.URLPath {
            
            if let request = self.getRequestFromUrl(path) {
                self.webView.loadRequest(request)
            }
        } else if let string = self.HTMLString {
            self.webView.loadHTMLString(string, baseURL: nil)
        }
    }

    
    override func viewWillAppear(animated: Bool) {
        super.viewWillAppear(animated)
        
        self.originNaviHidden = self.navigationController?.navigationBar.hidden
        self.originTabBarHidden = self.tabBarController?.tabBar.hidden
        self.navigationController?.navigationBar.hidden = false
        self.tabBarController?.tabBar.hidden = true
    }

    override func viewWillDisappear(animated: Bool) {
        super.viewWillDisappear(animated)
        
        if let naviHide = originNaviHidden {
            self.navigationController?.navigationBar.hidden = naviHide
        }
        
        if let tabBarHide = originTabBarHidden {
            self.tabBarController?.tabBar.hidden = tabBarHide
        }
        
        self.webView.stopLoading()
    }

    
    
    private func getRequestFromUrl(url: String) -> NSURLRequest? {
        
        let mutUrl = NSMutableString(string: self.decodeUrl(url))
        
        if let uRL = NSURL(string: String(mutUrl)) {
            let request = NSMutableURLRequest(URL: uRL)
            return request
        }
        
        return nil
    }
    
    private func decodeUrl (url: String) -> String {
        let mutStr = NSMutableString(string: url)
        
        mutStr.replaceOccurrencesOfString("+", withString: " ", options: NSStringCompareOptions.LiteralSearch, range: NSMakeRange(0, mutStr.length))
        
        return mutStr.stringByReplacingPercentEscapesUsingEncoding(NSUTF8StringEncoding) ?? ""
    }
    
}

extension MLWebViewController: MLWebViewDelegate {
    
    func mlWebViewDidGetTitle(title: String) {
        // 不需要自动设置
    }
    
    func mlWebViewDidOpenPageWithUrl(url: String) {

    }
    
}

