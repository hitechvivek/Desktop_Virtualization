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
<div id="logo">GCC</a></div>
<div id="container">
<h4>';
open FILE,">","123.c" or die $!;
$name=param("pro");
print  FILE "$name";
$a=system("gcc /opt/rubystack/apache2/cgi-bin/123.c > out");
if(!$a)
{
print "<h1>\nOUTPUT:\n</h1><br>";

system("/opt/rubystack/apache2/cgi-bin/a.out");

system("/opt/rubystack/apache2/cgi-bin/a.out > 12345.txt");
}
print '
<br>
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
