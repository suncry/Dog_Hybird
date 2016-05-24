
//
//  MLWebView.swift
//  MedLinker
//
//  Created by 蔡杨
//  Copyright © 2015年 MedLinker. All rights reserved.
//

import UIKit
import CoreMotion


@objc protocol MLWebViewDelegate {
}

@objc protocol JSExportTest: JSExport{
    func requestNative(params: [String])
}

class MLWebView: UIView {

    /**************************************************/
    //MARK: - property
    var context = JSContext()
    
    var myWebView = UIWebView()
    var urlStr = "" {
        didSet {
            urlStr = self.decodeUrl(urlStr)
            self.loadUrl()
        }
    }
    weak var delegate: MLWebViewDelegate?
    var errorDataView: UIView?
    var motionManager: CMMotionManager = CMMotionManager()
    
    /**************************************************/
    //MARK: - life cycle
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        self.initUI()
        self.configUserAgent()
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func initUI () {
        myWebView.frame = CGRectMake(0, 0, self.bounds.size.width, self.bounds.size.height)
//        myWebView.backgroundColor = UIColor(RGBString: "f5f5f5")
        myWebView.backgroundColor = UIColor.whiteColor()

        myWebView.delegate = self
        self.addSubview(myWebView)
    }
    
    func loadUrl () {
        if let url = NSURL(string: self.urlStr) {
            let urlReq = NSURLRequest(URL: url)
            self.myWebView.loadRequest(urlReq)
        }
        
    }
    
    //设置userAgent
    func configUserAgent () {
        var userAgentStr: String = UIWebView().stringByEvaluatingJavaScriptFromString("navigator.userAgent") ?? ""
        
        if (userAgentStr.rangeOfString("hybrid_/") == nil) {
            let versionStr = NSBundle.mainBundle().infoDictionary!["CFBundleShortVersionString"]
            userAgentStr.appendContentsOf(" hybrid_/\(versionStr!) ")
            NSUserDefaults.standardUserDefaults().registerDefaults(["UserAgent" : userAgentStr])
        }
    }
    
    /**************************************************/
    //MARK: - tool
    
    /**
     * url decode
     */
    private func decodeUrl (url: String) -> String {
        let mutStr = NSMutableString(string: url)
        
        mutStr.replaceOccurrencesOfString("+", withString: " ", options: NSStringCompareOptions.LiteralSearch, range: NSMakeRange(0, mutStr.length))
        
        return mutStr.stringByReplacingPercentEscapesUsingEncoding(NSUTF8StringEncoding) ?? ""
    }
    
    private func decodeJsonStr(jsonStr: String) -> [String: AnyObject] {
        
        if let jsonData = jsonStr.dataUsingEncoding(NSUTF8StringEncoding) {
            do {
                return try NSJSONSerialization.JSONObjectWithData(jsonData, options: NSJSONReadingOptions.MutableContainers) as! [String: AnyObject]
            } catch let error as NSError {
                print(error)
            }
        }
        
        return [String: AnyObject]()
    }
    
    /**************************************************/
    //MARK: - h5交互协议
    
    func handleEvent(funType: String, args: [String: AnyObject]) {
        print("   ")
        print("****************************************")
        print("funType === \(funType)")
        print("args === \(args)")
        print("****************************************")
        print("   ")
        if funType == "updateheader" {
            self.updateHeader(args)
        } else if funType == "back" {
            self.back(args)
        } else if funType == "forward" {
            self.forward(args)
        }
    }
    
    func updateHeader(args: [String: AnyObject]) {
        if let header = Hybrid_headerModel.yy_modelWithJSON(args) {
            if let vc = self.delegate as? UIViewController, let titleModel = header.title, let rightButtons = header.right, let leftButtons = header.left {
                vc.navigationItem.titleView = self.setUpNaviTitleView(titleModel)
                vc.navigationItem.setRightBarButtonItems(self.setUpNaviButtons(rightButtons), animated: true)
                vc.navigationItem.setLeftBarButtonItems(self.setUpNaviButtons(leftButtons), animated: true)
            }
        }
    }
    func setUpNaviTitleView(titleModel:Hybrid_titleModel) -> HybridNaviTitleView {
        let naviTitleView = HybridNaviTitleView()
        naviTitleView.frame = CGRectMake(0, 0, 150, 30)
        let leftUrl = NSURL(string: titleModel.lefticon) ?? NSURL()
        let rightUrl = NSURL(string: titleModel.righticon) ?? NSURL()
        naviTitleView.loadTitleView(titleModel.title, subtitle: titleModel.subtitle, lefticonUrl: leftUrl, righticonUrl: rightUrl, callback: titleModel.callback, currentWebView: self.myWebView)
        return naviTitleView
    }
    func setUpNaviButtons(buttonModels:[Hybrid_naviButtonModel]) -> [UIBarButtonItem] {
        var buttons = [UIBarButtonItem]()
        for buttonModel in buttonModels {
            let button = UIButton()

            let titleWidth = buttonModel.value.stringWidthWith(14, height: 20)
            let buttonWidth = titleWidth > 30 ? titleWidth : 30
            button.frame = CGRectMake(0, 0, buttonWidth, 30)

            button.titleLabel?.font = UIFont.systemFontOfSize(14)
            button.setTitleColor(UIColor.blackColor(), forState: .Normal)

            if buttonModel.value.characters.count > 0 {
                button.setTitle(buttonModel.value, forState: .Normal)
            }
            if buttonModel.icon.characters.count > 0 {
                button.setImageForState(.Normal, withURL: NSURL(string: buttonModel.icon) ?? NSURL())
            }
            else if buttonModel.tagname.characters.count > 0 {
                button.setImage(UIImage(named: "hybird_navi_" + buttonModel.tagname), forState: .Normal)
            }
            button.addBlockForControlEvents(.TouchUpInside, block: { (sender) in
                self.myWebView.stringByEvaluatingJavaScriptFromString("Hybrid.Header_Event." + "\(buttonModel.callback)();")
            })
            let menuButton = UIBarButtonItem(customView: button)
            buttons.append(menuButton)
        }
        return buttons.reverse()
    }
    
    func back(args: [String: AnyObject]) {
        if let vc = self.delegate as? UIViewController {
            vc.navigationController?.popViewControllerAnimated(true)
        }
    }
    
    func forward(args: [String: AnyObject]) {
        if let vc = self.delegate as? UIViewController {
            if  args["type"] as? String == "h5" {
                if let url = args["topage"] as? String {
                    let web = MLWebViewController()
                    web.hidesBottomBarWhenPushed = true
                    
                    if url.hasPrefix("http") {
                        web.URLPath = url
                    } else {
                        web.URLPath = "http://web.test.pdt5.medlinker.net/webapp/" + url
                    }
                    vc.navigationController?.pushViewController(web, animated: true)
                }
            } else {
                if  args["topage"] as! String == "index2" {
                    let webTestViewController = WebTestViewController.instance()
                    
                    if let animate =  args["animate"] as? String where animate == "present" {
                        
                        let navi = UINavigationController(rootViewController: webTestViewController)
                        vc.presentViewController(navi, animated: true, completion: nil)
                    }
                    else {
                        if let animate =  args["navigateion"] as? String where animate == "none" {
                            vc.navigationController?.navigationBarHidden = true
                            vc.navigationController?.pushViewController(webTestViewController, animated: true)
                        }
                        else {
                            vc.navigationController?.navigationBarHidden = false
                            vc.navigationController?.pushViewController(webTestViewController, animated: true)
                        }
                    }
                }
            }
        }
    }

    
    /**************************************************/
    //MARK: -  public
    
    func loadRequest(request: NSURLRequest) {
        self.myWebView.loadRequest(request)
    }
    func loadHTMLString(str: String, baseURL: NSURL?) {
        self.myWebView.loadHTMLString(str, baseURL: baseURL)
    }
    func stopLoading() {
        self.myWebView.stopLoading()
    }

}

extension MLWebView: UIWebViewDelegate {
    
    func webViewDidStartLoad(webView: UIWebView) {

    }
    
    func webViewDidFinishLoad(webView: UIWebView) {
    }
    
    func webView(webView: UIWebView, didFailLoadWithError error: NSError?) {

    }
    
    func webView(webView: UIWebView, shouldStartLoadWithRequest request: NSURLRequest, navigationType: UIWebViewNavigationType) -> Bool {
        self.context = webView.valueForKeyPath("documentView.webView.mainFrame.javaScriptContext") as? JSContext
        self.context.exceptionHandler = { context, exception in
            print("JS Error: \(exception)")
        }
        let requestNative: @convention(block) String -> Bool = { input in
            let args = self.decodeJsonStr(input)
            if let tagname = args["tagname"] as? String {
                if let param = args["param"] as? [String: AnyObject] {
                    self.handleEvent(tagname, args: param)
                }
                else {
                    self.handleEvent(tagname, args: ["":""])
                }
                return true
            }
            else {
                return false
            }
        }
        context.setObject(unsafeBitCast(requestNative, AnyObject.self), forKeyedSubscript: "requestNative")
        
//        UIWebView* webView = [[UIWebView alloc] initWithFrame:CGRectZero];
//        NSString* secretAgent = [webView stringByEvaluatingJavaScriptFromString:@"navigator.userAgent"];

//        let secretAgent = self.myWebView.stringByEvaluatingJavaScriptFromString("navigator.userAgent")
//        print(secretAgent)
////        NSString *newUagent = [NSString stringWithFormat:@"%@ appname/3.5.2",secretAgent];
////        NSDictionary *dictionary = [[NSDictionary alloc]
////        initWithObjectsAndKeys:newUagent, @"UserAgent", nil nil];
////        [[NSUserDefaults standardUserDefaults] registerDefaults:dictionary];
//        let newUagent = "\(secretAgent) hybrid_1.1.1 "
//        print(newUagent)
        
        return true
    }

}

