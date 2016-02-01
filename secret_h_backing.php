<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);
session_start();

function getGameData( $database, $game_id, $user_id ){
    $result = [];
    $game = $database->select("game","*", ["game_id" => $game_id] )[0];
    $users = $database->select("users", ["[>]game_user" =>"user_id"], ["user_name","role","locked_in", "user_id"], ["game_id" => $game_id]);
    $role = $database->select("game_user", ["role","user_id"], [ "user_id" => $user_id, "game_id" => $game_id])[0];
    
    $result['game'] = $game;
    
    $status = $game['game_status'];
    $result[ $status ] = true;
    $result[ "users" ] = [];
    $result[ "joined" ] = [];
    $result[ "owner" ] = ( $game['owner_id'] == $user_id );
    $h_count = 0;
    $f_count = 0;
    foreach( $users as $user )
    {
      array_push($result["joined"], ["user_name" => $user["user_name"] ]);
      if( $user['role'] == 'f' ){
        $f_count++;
      } 
      else if( $user['role'] == 'h' ){
        $h_count++;
      }
      if( $user["user_id"] == $user_id ){
        $result["hasJoined"] = true;
      }
    }
    $result['f_count'] = $f_count;
    $result['h_count'] = $h_count;
    
    if( $status == 'lockedin'){
        $result['lockedin'] = true;
        if( $role == 'f'){
          foreach( $users as $user )
          {
            if( $user['role'] == 'f' || $user['role'] == 'h' ){
                array_push( $result["users"], $user );
            }
          }
        }
    }
  
  return $result;
}


?>
<?php
  require  'lib/medoo.php';

try{
  $database = new medoo([
      // required
      'database_type' => 'mysql',
      'database_name' => 'secret_h',
      'server' => 'localhost',
      'username' => 'recipe',
      'password' => 'mPu92jfqRJSVMa8H',
      'charset' => 'utf8' 
  ]);
  
  $method = "";
  $user_id = $_SESSION[ 'user_id' ];
  
  if( $_GET != null){
    $method = $_GET['method'];
  }
  else if( $_POST != null ){
    $method = $_POST['method'];
  }
  //print( $method );
  
  if( strcmp( $method , "checkUserName") == 0 ){
    $data = $database->select("users", "user_name", [ "user_name" => $_GET['user_name'] ] );
    
    print( json_encode($data) );                         
  }
  else if( $method == "login" ){
    $pw = sha1( $_POST['password'] );
    $uname = $_POST['user_name'];
    $data = $database->select("users", ["password","user_name","user_id"], [ "user_name" => $uname ]);
    
    if( $data[0]['password'] == $pw ){
      $data[0]['password'] = "";
      print( json_encode($data) );
      $_SESSION['user_id'] = $data[0]['user_id'];
    }
    else{
      print( json_encode([]));
    }
  }
  else if( $method == "create" ){
    $pw = sha1( $_POST['password'] );
    $uname = $_POST['user_name'];
    
    $data = $database->insert("users", ["user_name"=>$uname, "password" => $pw ] );
    
    $resp = [ "user_name" => $uname, "user_id" => $data ];
    
    print( json_encode($resp) );
  }
  else if( $method == "game_list" ){
    $data = $database->select("game","*", [] );
    
    print( json_encode( $data ) );
  }
  else if( $method == "game_view" ){
    $game_id = $_GET[ 'game_id' ];
    $result = getGameData( $database, $game_id, $user_id );
    
    print( json_encode( $result ) );
  }
  else if( $method == "create_game" ){
    $game_name = $_POST['game_name'];
    $data = ["game_name"=>$game_name, "game_type"=>"sh", "game_status"=>"pending", "owner_id" => $user_id ];
    $game_id = $database->insert( "game", $data );
    
    $insert = ["user_id" => $user_id, "game_id" => $game_id, "locked_in" => "N" ];
    $database->insert("game_user", $insert );
    
    $data = $database->select("game","*", [] );
    
    print( json_encode( $data ) );
  }
  else if( $method == "start_game"){
    $game_id = $_POST[ 'game_id' ];
    $database->update("game",["game_status" => "started"], ["game_id"=> $game_id ] );
    
    $result = getGameData( $database, $game_id, $user_id );
    
    print( json_encode( $result ));
  }
  else if( $method == "join_game"){
    $game_id = $_POST[ 'game_id' ];
    $data = ["user_id" => $user_id, "game_id" => $game_id, "locked_in" => "N" ];
    $database->insert("game_user", $data );
    
    $result = getGameData( $database, $game_id, $user_id );
    print( json_encode( $result ));
  }
  else if( $method == "select_role"){
    $game_id = $_POST[ 'game_id' ];
    $role = $_POST[ 'role' ];
    $database->update("game_user",["role" => $role], ["game_id"=> $game_id, "user_id" => $user_id ] );
    
    $result = getGameData( $database, $game_id, $user_id );
    print( json_encode( $result ));
  }
  
 
} catch (Exception $e) {
    echo 'Caught exception: ',  $e->getMessage(), "\n";
}


?>