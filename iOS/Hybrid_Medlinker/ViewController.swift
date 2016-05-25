//
//  ViewController.swift
//  Hybrid_Medlinker
//
//  Created by caiyang on 16/5/12.
//  Copyright © 2016年 caiyang. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    @IBAction func buttonClick(sender: AnyObject) {
        let web = MLWebViewController()
        web.hidesBottomBarWhenPushed = true
        web.URLPath = "http://medlinker.com/webapp/flight/index.html"
        self.navigationController?.pushViewController(web, animated: true)
    }

}

