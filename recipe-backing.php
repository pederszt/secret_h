<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
?>
<?php
  require  'lib/medoo.php';

try{
  $database = new medoo([
      // required
      'database_type' => 'mysql',
      'database_name' => 'recipe',
      'server' => 'localhost',
      'username' => 'recipe',
      'password' => 'mPu92jfqRJSVMa8H',
      'charset' => 'utf8' 
  ]);
  
  
  $request_body = file_get_contents('php://input');
  if( $request_body != null ){
    $json = json_decode( $request_body, true );
    if($json['data']){
      $json = $json['data'];
    }
        
    $resultObj = array();
    if( $json['recipe_id'] != null ){
      $recipe_id = $json['recipe_id'];
      $where = [ 'recipe_id' => $recipe_id ];
      $result= $database->update( "recipe", $json, $where );
    }
    else{
      $result= $database->insert( "recipe", $json );
      $resultObj["recipe_id"] = $result;
    }
    
    print_r(json_encode($resultObj));
    
  }
  else
  {
    $data = $database->select("recipe", "*", []);
    foreach( $data as &$row ){
      $ingredients = $database->select("recipe_ingredient",
                        [ "[>]ingredient" => "ingredient_id", "[>]measure" => "measure_id" ], "*", [ "recipe_id" => $row["recipe_id"]]);
      $row["ingredients"] = $ingredients;
      foreach( $ingredients as &$ing){
        if( $ing["amount"] == 1 ){
          $ing["measure"] = $ing["measure_abbr"];
        }
        else{
          $ing["measure"] = $ing["measure_plural_abbr"];
        }
      }
    }
    print_r( json_encode($data) );
  }
} catch (Exception $e) {
    echo 'Caught exception: ',  $e->getMessage(), "\n";
}


?>