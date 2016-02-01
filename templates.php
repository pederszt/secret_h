<?php 
$templates = scandir( "./templates");
$templateArr = array();
foreach( $templates as $template){
  if( strpos($template, ".html") > -1 ) {
    $tmplName = substr( $template, 0, strpos( $template, ".html"));
    $fileContents = file_get_contents('./templates/' . $template , true );
    $templateArr[ $tmplName ] = $fileContents; 
  }
}
print_r( json_encode( $templateArr) );
?>