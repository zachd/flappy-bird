<?php

// Nice Time function from http://php.net/manual/en/function.time.php#89415
function nicetime($date){
    if(empty($date)) return "Unknown"; $periods  = array("sec", "min", "hr", "day", "wk", "mth", "yr", "dcde");
    $lengths = array("60","60","24","7","4.35","12","10");$now = time();$unix_date = $date;if(empty($unix_date)) return "Bad date";
    if($now > $unix_date){ $difference = $now - $unix_date;$tense = "ago";} else {$difference = $unix_date - $now; $tense = "from now";}
    for($j = 0; $difference >= $lengths[$j] && $j < count($lengths)-1; $j++) 
    $difference /= $lengths[$j]; $difference = round($difference);
    if($difference != 1) $periods[$j].= "s";$returnstring = "$difference $periods[$j] {$tense}";
    return (($returnstring == "0 secs from now" || $returnstring == "1 sec from now") ? "just now" : $returnstring);
}

// Returns a list of users online now
function printusers($currentname) {
  $array = array(); $onlinetime = array(); $onlineplays = array(); $countonline = array(); $totalplays = 0;
  $mostactiveusercount = 0; $mostactiveuser = ""; $totalscore = 0;
  
  // Loops through all users in score directory
  if ($handle = opendir('scores')) {
    while (false !== ($entry = readdir($handle)))
      if ($entry != "." && $entry != ".."){
        preg_match("~(\d+)\|?(\d*)\|?(\d*).*?~", file_get_contents("/home/zach/flappy/scores/" . $entry), $fileresults);
        if($fileresults[1] < 1000){
          $userplays = ((!$fileresults[2] && !$fileresults[3]) || !$fileresults[3]) ? 1 : $fileresults[3];
          // Add to main array
          $array[$entry] = $fileresults[1];
          // Add to total play count
          $totalplays += $userplays;
          // Add to total score count
          $totalscore += $fileresults[1];
          // Add to most popular player
          if($userplays >= $mostactiveusercount){
            $mostactiveusercount = $userplays;
            $mostactiveuser = $entry;
          }
          // Add to count online array
          if(time() - filemtime("/home/zach/flappy/scores/" . $entry) <= 600){
            $countonline[$entry] = $fileresults[1];
            $onlinetime[$entry] = filemtime("/home/zach/flappy/scores/" . $entry);
            $onlineplays[$entry] = $userplays;
          }
          // Add to one hour array
          if(time() - filemtime("/home/zach/flappy/scores/" . $entry) <= (60 * 60))
            $counthour++;
          // Add to today array
          if(time() - filemtime("/home/zach/flappy/scores/" . $entry) <= (60 * 60 * 24))
            $counttoday++;
        }
      }
    closedir($handle);
  }
  // Sort array
  arsort($array);
  
  // Print users online
  echo '<span id="usersheader">'.(count($countonline) == 0 ? 'NO ONE' : (count($countonline) == 1 ? 
       '1 USER' : count($countonline).' USERS')).' ONLINE</span><br /><br />';
  $i = 1;
  // Print list of users currently online now
  // Show name in red if the score is in top 35
  foreach($array as $name => $score){
    if($score < 1000){
      if(array_key_exists($name, $countonline)){
        echo '<span title="Seen: '.nicetime($onlinetime[$name]).' - Plays: '.number_format($onlineplays[$name]).'">'.$i.'. <span id="'.$name.'"'
        .($name == $currentname ? ' style="color:'.($i <= 35 ? '#FFD700' : 'red').';font-weight:bold;"' : '')
        .'>'.$name.'</span> '.($name == $currentname ? '<b>'.floor($score).'</b>' : floor($score)).'<br /></span>';
      }
      $i++;
    }
  }
  
  // Calculate total time wasted on site using average score * total plays in seconds 
  // 1 point = 1 second for a game, and each game = 2 seconds + total points
  // Algorithm: [ (total of all hiscores) + (extra 2 secs) ] +  [ (plays with unknown score) * (avg score + extra 2 secs) ]
  $avgplaysperuser = $totalplays/count($array);
  $avgscoreperuser = $totalscore/count($array);
  $totaltimewasted = ($totalscore + (count($array) * 2) + (($totalplays - count($array)) * ($avgscoreperuser + 2)));
  
  // Print playing stats section
  echo '<span id="playingstats">';
  echo '<!--<br /><span id="usersheader" title="Plays: '.number_format($mostactiveusercount).'">MOST ACTIVE: '.$mostactiveuser.' ('.number_format($mostactiveusercount).')</span>';
  echo '<br />-->';
  echo '<br /><span id="usersheader">PLAYS/USER: '.round($avgplaysperuser, 2).'</span>';
  echo '<br /><span id="usersheader">GLOBAL PLAYS: '.number_format($totalplays).'</span>';
  echo '<br /><span id="usersheader">TOTAL POINTS: '.number_format($totalscore).'</span>';
  echo '<br />';
  echo '<br /><span id="usersheader">AVG TIME: ~'.round((($totaltimewasted / $totalplays)), 1).' SECS</span>';
  echo '<br /><span id="usersheader">TIME WASTED: ~'.round(($totaltimewasted / 3600), 1).' HRS</span>';
  echo '<br />';
  echo '<!--<br /><span id="usersheader">LAST HOUR: '.($counthour == 0 ? 'NO PLAYERS' : ($counthour == 1 ? 
       'ONE PLAYER' : number_format($counthour) . ' PLAYERS')).'</span>-->';
  echo '<br /><span id="usersheader">TODAY: '.($counttoday == 0 ? 'NO PLAYERS' : ($counttoday == 1 ? 
       'ONE PLAYER' : number_format($counttoday) . ' PLAYERS')).'</span>';
  echo '<br /><span id="usersheader">ALL TIME: '.(count($array) == 0 ? 'NO PLAYERS' : (count($array) == 1 ? 
       'ONE PLAYER' : number_format(count($array)) . ' PLAYERS')).'</span>';
  echo '</span>';
}

// Prints a list of all the current hiscores
function printscores($currentname, $all) {
  $array = array(); $arraytime = array(); $arrayplays = array();
  
  // Loop through the scores directory
  if ($handle = opendir('scores')) {
    while (false !== ($entry = readdir($handle)))
      if ($entry != "." && $entry != ".."){
            preg_match("~(\d+)\|?(\d*)\|?(\d*).*?~", file_get_contents("/home/zach/flappy/scores/" . $entry), $fileresults);
            $array[$entry] = $fileresults[1];
            $arraytime[$entry] = filemtime("/home/zach/flappy/scores/" . $entry);
            $arrayplays[$entry] = ((!$fileresults[2] && !$fileresults[3]) || !$fileresults[3]) ? "?" : $fileresults[3];
      }
    closedir($handle);
   }
  arsort($array);
  
  // Print the scoreboard section
  echo '<span id="scoreheader">SCOREBOARD ('.count($array).')</span><br /><br />';
  $i = 1;
  foreach($array as $name => $score){
    if($score < 1000){
      echo ($i < 10 ? '<span style="color:#abc">0</span>' : '').'<span title="Seen: '.nicetime($arraytime[$name]).' - Plays: '.$arrayplays[$name].'">'.
      $i.'. <span id="'.$name.'"'.($name == $currentname ? ' style="color:#FFD700;"' : '').'>'.$name.'</span> '.
      ($name == $currentname ? '<b>'.floor($score).'</b>' : floor($score)).'<br /></span>';
      $i++;
      // Only show top 35 on the page unless "Show All" flag set
      if($i == 36){
        if(array_search($currentname,array_keys($array)) >= 36)
          echo '&nbsp;|<br /><span title="Seen: '.nicetime($arraytime[$currentname]).' - Plays: '.$arrayplays[$currentname].'">'.
          array_search($currentname,array_keys($array)).'. <span id="'.$currentname.'" style="color:red;font-weight:bold;">'.$currentname.'</span> '.
          '<b>'.floor($array[$currentname]).'</b></span>';
        else if(!$all)
          echo '<br />';
        echo ($all == true ? '<span>' : '<br /><a href="?all" style="text-decoration:none;color:black;">Show All</a> - <span style="display:none;">');
      }
    }
  }
  echo "</span>";
}

// Receive post request
if((/*isset($_SERVER['HTTP_REFERER']) && strcasecmp($_SERVER['HTTP_CONNECTION'], 'keep-alive') == 0 && isset($_SERVER['HTTP_ACCEPT_LANGUAGE']) &&*/ !(stripos($_SERVER['HTTP_USER_AGENT'], 'wget') !== false)) || $_POST['test'] == 1){

  // Name Check - ALLOW: A-Z a-z 0-9 = > < . - _ ~ , ; : [ ] ( )
  $name = substr(preg_replace("([^\w\s\d\=\>\<\.\-_~,;:\[\]\(\)])", '', strip_tags(ucfirst($_POST['name']))), 0, 10);
  while(substr($name, 0, 1) == " ") $name = substr($name, 1, strlen($name));

  // Do POST Processing
  
  // Get top scores
  if($_POST['top'] == 1){
    $array = array();
    if ($handle = opendir('scores')) {
      while (false !== ($entry = readdir($handle)))
        if ($entry != "." && $entry != ".." && file_get_contents("/home/zach/flappy/scores/" . $entry) < 1000){
            preg_match("~(\d+)\|?(\d*).*?~", file_get_contents("/home/zach/flappy/scores/" . $entry), $fileresults);
            $array[$entry] = $fileresults[1];
        }
      closedir($handle);
     }
    arsort($array);
    echo strip_tags(current(array_keys($array))) . " (" . $array[current(array_keys($array))] . ")";
    echo '|';
    if($name){
      preg_match("~(\d+)\|?(\d*).*?~", file_get_contents("/home/zach/flappy/scores/" . $name), $fileresults);
      echo $fileresults[1];
    }
  // Save score to file if legitimate
  } else if($_POST['name'] && strlen($name) > 0 && $_POST['score'] >= 0){
    if(!(!$name || $name == "Please enter your name" || $name == "null")){
      if($_POST['score'] < 1000){ // Valid Score
        if (!file_exists("/home/zach/flappy/scores/".$name)){ // No File Exists
          file_put_contents("/home/zach/flappy/scores/".$name, floor($_POST['score']) ."|". floor($_POST['score']) ."|". "1");
        } else { // Exists
          preg_match("~(\d+)\|?(\d*)\|?(\d*).*?~", file_get_contents("/home/zach/flappy/scores/" . $name), $fileresults);
          
          // Get new play count
          if((!$fileresults[2] && !$fileresults[3]) || !$fileresults[3])
            $plays = 0;
          else
            $plays = intval($fileresults[3]);
            
          // Get high score number
          if($fileresults[1] < $_POST['score']) 
            $scoretoadd = floor($_POST['score']);
          else
            $scoretoadd = $fileresults[1];
          
          // Post it
          file_put_contents("/home/zach/flappy/scores/".$name, $scoretoadd ."|". floor($_POST['score']) ."|". ($plays + 1));
        }
      }
    }
    preg_match("~(\d+)\|?(\d*).*?~", file_get_contents("/home/zach/flappy/scores/" . $name), $fileresults);
    echo $fileresults[1].'|'; // High Score
    printscores($name, false); echo '|'; // Update Scoreboard
    printusers($name); // Update Users Online
  }
} else {
   file_put_contents("test.log",  file_get_contents("test.log")."Bad Request from ".$_SERVER['REMOTE_ADDR']." (".date('m/d/Y h:i:s a', time())."):
  ".var_export($_SERVER, true)."
  ".var_export($_POST, true)." 
");
}
?>
