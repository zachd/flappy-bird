<?php
require("score.php");
require_once("assets/detect.php");
$detect = new Mobile_Detect;
if($detect->isMobile())
   header('Location: http://zach.ie/flappy/m');
?>
<html>
    <head>
        <title>Flappy Doge</title>
        <meta name="viewport" content="width=device-width, user-scalable=no">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <link rel="apple-touch-icon" href="assets/icon.png">
        <link rel="apple-touch-icon" sizes="120x120" href="assets/icon.png">
        <link rel="shortcut icon" href="assets/doge.ico" type="image/x-icon" />
        <meta property="fb:admins" content="1434685963"/>
        <meta property="og:site_name" content="Flappy Doge"/>
        <meta property="og:title" content="Flappy Doge"/>
        <meta property="og:type" content="website"/>
        <meta property="og:url" content="http://zach.ie/flappy/doge"/>
        <meta property="og:image" content="http://zach.ie/flappy/assets/dogeicon.png" />
        <meta property="og:description" content="Such Flap! So WOW! Flappy Bird HTML5 Game with added Doge!" />
        <style>
            body {
                background: #abc;
                margin: 0;
                padding: 0;
            }
            #container {
                width: 100%;
            }
            #users {
                position: absolute;
                top: 0;
                left: 0;
                margin: 1%;
                font-family: "Press Start 2P";
                font-size: 12px;
                height:600px;
                z-index: 0;
            }
            #usersheader {
                font-size: 10px;
            }
            #usersvalues {
                padding-top: 10px;
                line-height: 130%;
            }
            #playingstats {
                bottom:10px;
                position: absolute;
                left: 0;
                width: 250px;
            }
            #screen {
                position:relative;
                margin: 0 auto;
                max-width: 800px;
                max-height: 800px;
                overflow: hidden;
                z-index: 1;
            }
            #scores {
                position: absolute;
                top: 0;
                right: 0;
                margin: 1%;
                font-family: "Press Start 2P";
                font-size: 12px;
                z-index: 0;
            }
            #scoreheader {
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
        </style>
    <script type="text/javascript">
    function toggle_visibility(id) {
       var e = document.getElementById(id);
       if(e.style.display == 'block')
          e.style.display = 'none';
       else
          e.style.display = 'block';
    }
    </script>
    </head>
    <body>
      <div id="container">
        <div id="users"><span id="usersvalues"><?php 
        printusers("");
        ?></span></div>
        <div id="screen"></div>
        <div id="scores"><span id="scorevalues"><?php 
        printscores("", isset($_GET['all']));
        ?></span></div>
        <script src="js/phaser.min.js"></script>
        <script src="js/doge.js"></script>
        <div id="footer">original html5 game by &nbsp;<a href="http://uralozden.com/flappy/" target="_blank" class="footerlink">Ural Özden</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;forked by zach diebold</div>
      </div>
    </body>
</html>
