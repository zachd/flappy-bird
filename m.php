<?php
require("score.php");
require_once("assets/detect.php");
$detect = new Mobile_Detect;
if(!$detect->isMobile())
   header('Location: http://zach.ie/flappy/');
?>
<html>
  <head>
    <title>Mobile Flappy Bird</title>
    <meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <link rel="apple-touch-icon" href="assets/icon.png">
    <link rel="apple-touch-icon" sizes="120x120" href="assets/icon.png">
    <link rel="shortcut icon" href="assets/birdie.ico" type="image/x-icon" />
    <meta property="fb:admins" content="1434685963"/>
    <meta property="og:site_name" content="Mobile Flappy Bird"/>
    <meta property="og:title" content="Mobile Flappy Bird"/>
    <meta property="og:type" content="website"/>
    <meta property="og:url" content="http://zach.ie/flappy/m.php"/>
    <meta property="og:image" content="http://zach.ie/flappy/assets/icon.png" />
    <meta property="og:description" content="A better version of Ural Özden's HTML5 Flappy Bird game which adds high score saving, custom game messages and a larger screen size." />
    <style>
        body {
            background: #abc;
            margin: 0;
            padding: 0;
        }
        #container {
            width: 100%;
        }
        #link {
            top: 0;
            left: 0;
            margin: 3%;
            line-height: 150%;
            position: absolute;
            font-family: "Press Start 2P";
            font-size: 16px;
        }
        #screen {
            margin: 0 auto;
            max-width: 800px;
            max-height: 800px;
            overflow: hidden;
        }
        #scores {
            position: relative;
            padding-top:20px;
            font-family: "Press Start 2P";
            font-size: 12px;
        }
        .scoretext {
            font-size: 10px;
        }
        #scorevalues {
            padding-top: 10px;
            line-height: 130%;
        }
        #footer {
            text-align:center;
            text-transform: uppercase;
            margin-top:10px;
            font-size: 9px;
        }
        .footerlink {
            text-decoration: none;
            color: black;
        }
    </style>
    </head>
    <body>
      <div id="container">
        <div id="screen"></div>
        <script src="js/phaser.min.js"></script>
        <script src="js/mobile.js"></script>
      </div>
    </body>
</html>
