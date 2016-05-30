//
//  ViewController.swift
//  Hybrid_Medlinker
//
//  Created by caiyang on 16/5/12.
//  Copyright © 2016年 caiyang. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    @IBAction func buttonClick(sender: AnyObject) {
        let web = MLWebViewController()
        web.hidesBottomBarWhenPushed = true
//        web.URLPath = "http://medlinker.com/webapp/flight/index.html"
        web.URLPath = "http://kuai.baidu.com/webapp/demo/index.html"
        self.navigationController?.pushViewController(web, animated: true)
    }

}

