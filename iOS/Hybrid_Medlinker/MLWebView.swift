
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

class MLWebView: UIView {

    //地址相关
//    let BASE_URL = "http://medlinker.com/webapp/"
    let BASE_URL = "http://kuai.baidu.com/webapp/"
    let USER_AGENT_HEADER = "hybrid_"

    //事件类型
    let UpdateHeader = "updateheader"
    let Back = "back"
    let Forward = "forward"
    let Get = "get"
    let Post = "post"
    let ShowLoading = "showLoading"
    let HideLoading = "hideLoading"
    
    //Event前缀
    let HybirdEvent = "Hybrid.callback"

    //资源路径相关
    let NaviImageHeader = "hybird_navi_"
    let LocalResources = "DogHybirdResources/"
    
    
    /**************************************************/
    //MARK: - property
    var context = JSContext()
    
    var requestNative: (@convention(block) String -> Bool)?
    
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
        
        self.requestNative = { input in
            let args = MLWebView().decodeJsonStr(input)
//            print("requestNative args == \(args)")
            if let tagname = args["tagname"] as? String {
                let callBackId = args["callback"] as? String ?? ""
                if let param = args["param"] as? [String: AnyObject] {
                    self.handleEvent(tagname, args: param, callbackID: callBackId)
                }
                else {
                    self.handleEvent(tagname, args: ["":""], callbackID: callBackId)
                }
                return true
            }
            else {
                print("tagname 空了哟")
                let alert = UIAlertView(title: "提示", message: "tagname 空了哟", delegate: nil, cancelButtonTitle: "cancel")
                alert.show()
                return false
            }
        }
        
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
        
        if (userAgentStr.rangeOfString(USER_AGENT_HEADER) == nil) {
            let versionStr = NSBundle.mainBundle().infoDictionary!["CFBundleShortVersionString"]
            userAgentStr.appendContentsOf(" \(USER_AGENT_HEADER)\(versionStr!) ")
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
                return try NSJSONSerialization.JSONObjectWithData(jsonData, options: NSJSONReadingOptions.MutableContainers) as? [String: AnyObject] ?? ["":""]
            } catch let error as NSError {
                print(error)
            }
        }
        return [String: AnyObject]()
    }
    
    /**************************************************/
    //MARK: - h5交互协议
    
    func handleEvent(funType: String, args: [String: AnyObject], callbackID: String = "") {
//        print("   ")
//        print("****************************************")
//        print("funType    === \(funType)")
//        print("args       === \(args)")
//        print("callbackID === \(callbackID)")
//        print("****************************************")
//        print("   ")
        if funType == UpdateHeader {
            self.updateHeader(args)
        } else if funType == Back {
            self.back(args)
        } else if funType == Forward {
            self.forward(args)
        } else if funType == Get {
            self.hybirdGet(args, callbackID: callbackID)
        } else if funType == Post {
            self.hybirdPost(args, callbackID: callbackID)
        } else if funType == ShowLoading {
            self.showLoading(args, callbackID: callbackID)
        } else if funType == HideLoading {
            self.hideLoading(args, callbackID: callbackID)
        } else if funType == "demoapi" {
            self.demoApi(args, callbackID: callbackID)
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
                button.setImage(UIImage(named: NaviImageHeader + buttonModel.tagname), forState: .Normal)
            }
            button.addBlockForControlEvents(.TouchUpInside, block: { (sender) in
                self.callBack("", errno: 0, msg: "成功", callback: buttonModel.callback)
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
        if let vc = self.delegate as? MLWebViewController {
            if  args["type"] as? String == "h5" {
                if let url = args["topage"] as? String {
                    let web = MLWebViewController()
                    web.hidesBottomBarWhenPushed = true
                    let localUrl = LocalResources + url.stringByReplacingOccurrencesOfString(".html", withString: "")
                    if let _ = NSBundle.mainBundle().pathForResource(localUrl, ofType: "html") {
                        //设置本地资源路径
                        web.localUrl = localUrl
                    }
                    else {
                        if url.hasPrefix("http") {
                            web.URLPath = url
                        } else {
                            web.URLPath = BASE_URL + url
                        }
                    }
                    if let animate = args["animate"] as? String where animate == "pop" {
                        vc.animateType = .Pop
                    }
                    else {
                        vc.animateType = .Normal
                    }
                    vc.navigationController?.pushViewController(web, animated: true)
                }
            } else {
                //这里指定跳转到本地某页面   需要一个判断映射的方法
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
        else {
            print("self.delegate 未找到")
        }
    }
    
    func showLoading(args: [String: AnyObject], callbackID: String) {
        if let vc = self.delegate as? MLWebViewController {
            vc.startLoveEggAnimating()
        }
    }
    
    func hideLoading(args: [String: AnyObject], callbackID: String) {
        if let vc = self.delegate as? MLWebViewController {
            vc.stopAnimating()
        }
    }

    func jsonStringWithObject(object: AnyObject) throws -> String {
        let data = try NSJSONSerialization.dataWithJSONObject(object, options: NSJSONWritingOptions(rawValue: 0))
        let string = String(data: data, encoding: NSUTF8StringEncoding)!
        return string
    }

    func hybirdGet(args: [String: AnyObject], callbackID: String) {
        let sessionManager = AFHTTPSessionManager(baseURL: nil)
        var parameters = args
        parameters.removeValueForKey("url")
        let url = args["url"] as? String ?? ""
        sessionManager.GET(url, parameters: parameters, progress: { (progress) in
            
            }, success: { (sessionDataTask, jsonObject) in
                if let callbackString = try? self.jsonStringWithObject(jsonObject!) {
                    self.callBack(callbackString, errno: 0, msg: "成功", callback: callbackID)
                }
            }, failure: { (sessionDataTask, error) in
                print(error)
        })
    }
    
    func hybirdPost(args: [String: AnyObject], callbackID: String) {
        let sessionManager = AFHTTPSessionManager(baseURL: nil)
        var parameters = args
        parameters.removeValueForKey("url")
        let url = args["url"] as? String ?? ""
        sessionManager.POST(url, parameters: parameters, progress: { (progress) in
            }, success: { (sessionDataTask, jsonObject) in
                if let callbackString = try? self.jsonStringWithObject(jsonObject!) {
                    self.callBack(callbackString, errno: 0, msg: "成功", callback: callbackID)
                }
            }, failure: { (sessionDataTask, error) in
                print(error)
        })
    }

    func demoApi(args: [String: AnyObject], callbackID: String) {
        self.callBack("磊哥你好", errno: 0, msg: "成功", callback: callbackID)
    }
    
    func toJSONString(dict: NSDictionary!)->NSString{
        if let jsonData = try? NSJSONSerialization.dataWithJSONObject(dict, options: NSJSONWritingOptions.PrettyPrinted) {
            if let strJson = NSString(data: jsonData, encoding: NSUTF8StringEncoding) {
                return strJson
            }
            else {
                return ""
            }
        }
        else {
            return ""
        }
    }

    func callBack(data:AnyObject, errno: Int, msg: String, callback: String) {
        let data = ["data": data,
                    "errno": errno,
                    "msg": msg,
                    "callback": callback]
        
        let dataString = self.toJSONString(data)
        self.myWebView.stringByEvaluatingJavaScriptFromString(self.HybirdEvent + "(\(dataString));")
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
        self.context = webView.valueForKeyPath("documentView.webView.mainFrame.javaScriptContext") as? JSContext
        self.context.exceptionHandler = { context, exception in
            let alert = UIAlertView(title: "JS Error", message: exception.description, delegate: nil, cancelButtonTitle: "ok")
            alert.show()
            print("JS Error: \(exception)")
        }
        self.context.setObject(unsafeBitCast(self.requestNative, AnyObject.self), forKeyedSubscript: "HybridRequestNative")
        self.myWebView.stringByEvaluatingJavaScriptFromString("Hybrid.ready();")
    }
    
    func webView(webView: UIWebView, didFailLoadWithError error: NSError?) {

    }
    
    func webView(webView: UIWebView, shouldStartLoadWithRequest request: NSURLRequest, navigationType: UIWebViewNavigationType) -> Bool {
        //此方法中还需对加载资源做出判断
        
        if let requestStr = request.URL?.absoluteString {
            if requestStr.hasPrefix("hybrid://") {
                let dataString = requestStr.stringByReplacingOccurrencesOfString("hybrid://", withString: "")
                let dataArray = dataString.componentsSeparatedByString("?")
                let function: String = dataArray[0] ?? ""
                
                let paramString = dataString.stringByReplacingOccurrencesOfString(dataArray[0] + "?", withString: "")
                let paramArray = paramString.componentsSeparatedByString("&")
                
                var paramDic: Dictionary = ["": ""]
                for str in paramArray {
                    let tempArray = str.componentsSeparatedByString("=")
                    paramDic.updateValue(tempArray[1], forKey: tempArray[0])
                }
                
                let args = self.decodeJsonStr(self.self.decodeUrl(paramDic["param"] ?? ""))
                let callBackId = paramDic["callback"] ?? ""
                
                self.handleEvent(function, args: args, callbackID: callBackId)

                return false
            }
        }
        return true
    }
    private func getPrefixOfStr(urlStr: String) -> (preStr: String?, leftStr: String) {
        let mutUrl = NSMutableString(string: urlStr)
        let range = mutUrl.rangeOfString(":")
        
        if range.length > 0 {
            let preStr = mutUrl.substringToIndex(range.location)
            let leftStr = mutUrl.substringFromIndex(range.location + 1)
            
            return (preStr, leftStr)
        }
        
        return (nil, urlStr)
    }

}
