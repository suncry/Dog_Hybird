//
//  WebTestViewController.swift
//  Hybrid_Medlinker
//
//  Created by caiyang on 16/5/12.
//  Copyright © 2016年 caiyang. All rights reserved.
//

import UIKit

class WebTestViewController: UIViewController {

//    @IBOutlet weak var webView: UIWebView!
    
    class func instance() -> WebTestViewController {
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        let viewController = storyboard.instantiateViewControllerWithIdentifier("WebTestViewController") as! WebTestViewController
        return viewController
    }

    override func viewDidLoad() {
        super.viewDidLoad()

//        let urlReq = NSURLRequest(URL: NSURL(string: "http://web.test.pdt5.medlinker.net/webapp/flight/index.html")!)
//        self.webView.loadRequest(urlReq)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
