#!/usr/bin/perl -wU
use CGI qw/:standard/;
print "Content-type: text/html\n\n";
print '<!DOCTYPE html
        PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
         "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" lang="en-US" xml:lang="en-US">
  <head>
    <title>CIT Mock Test</title>
    <link rel="stylesheet" type="text/css" href="../css/swish.css"/>
    <link rel="stylesheet" type="text/css" href="../css/local.css"/>
        <script type="text/javascript" src="../js/jquery.dataTables.js"></script>
        <script type="text/javascript" src="../js/jquery.dataTables.datesort.js"></script>
	<link href="../js/facebox/facebox.css" media="screen" rel="stylesheet" type="text/css" />
	<script type="text/javascript" src="../js/main.js"></script>
	<script type="text/javascript">
		var isLocal = "";
	</script>
  </head>
<body>
<div class="content">
<div id="logo">Remote Control</a></div>
<div id="container">
<h1>List of Available Virtual Machines</h1>
<h4>';
$name=param("vm1");
system("VBoxManage clonevm $name --name $name-clone --register");
print '<br>';
system('VBoxManage list vms');
print '</h4><h1>Running Machines</h1><h4>';
system('VBoxManage list runningvms');
print '<h1>Start Machines</h1>
<FORM METHOD="GET" ACTION="try.pl">
<INPUT TYPE="text" name="vm1" VALUE=""><input type="submit" name="submit" value="Start"> </FORM>
<h1>Stop Machines</h1>
<FORM METHOD="GET" ACTION="control2.pl">
<INPUT TYPE="text" name="vm1" VALUE=""><input type="submit" name="submit" value="Stop"> </FORM>
</h4>
<ul>
<font size="4 px" face="calibri">
</font>
</ul>
<center>
</div>
<div id="footer">
	Version 1.0&nbsp;|&nbsp;Copyright &copy 2012
</div>
</div>
</body>
</html>';
