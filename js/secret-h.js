var _loginView, _gameListView, _gameView = null;

var GameView = Backbone.View.extend({
  events:{
    "click .start-game": "startGame",
    "click .join-game": "joinGame",
    "click .reveal-roles": "revealRoles",
    "click .select-role": "selectRole"
  },
  el:".game-view",
  initialize:function( game ){
    this.game_id = game.gameId;
    var self = this;
    $.getJSON( "secret_h_backing.php",{method:"game_view", game_id: this.game_id },function( response ) {
      self.game = response;
      self.render();
    });
  },
  render: function(){
    this.$el.empty().html(
      TemplateManager.render("game_view", this.game )
    );
  },
  startGame: function(){
    var self = this;
    $.post( "secret_h_backing.php",{method:"start_game", game_id: this.game_id },function( response ) {
      self.game = response;
      self.render();
    });
  },
  joinGame: function(){
    var self = this;
    $.post( "secret_h_backing.php",{method:"join_game", game_id: this.game_id },function( response ) {
      self.game = response;
      self.render();
    });
  },
  revealRoles: function(){
    var self = this;
    $.post( "secret_h_backing.php",{method:"join_game", game_id: this.game_id },function( response ) {
      self.game = response;
      self.render();
    });
  },
  selectRole: function( e ){
    var self = this;
    var data = $(e.target).data();
    $.post( "secret_h_backing.php",{method:"select_role", game_id: this.game_id, role: data.role },function( response ) {
      self.game = response;
      self.render();
    });
  }
  
});

var GameListView = Backbone.View.extend({
  events:{ 
    "click .game-item": "selectGame",
    "click .create-game": "createGame",
  },
  el:".game-list-view",
  initialize:function( user ){
    this.user = user;
    var self = this;
    $.getJSON("secret_h_backing.php", {method:"game_list"}, function( response ){
      self.gameList = response;
      self.render();
    });
  },
  render: function(){
    this.$el.empty().html(
      TemplateManager.render("game_list", this.gameList )
    );
  },
  selectGame: function( e ){
    e.preventDefault();
    var game = $(e.target).data();
    _gameView = new GameView( game );
    this.hide();
  },
  hide: function( e ) {
    this.$el.hide();
  },
  createGame: function(){
    var self = this;
    var game_name = $("input#game_name").val();
    $.post("secret_h_backing.php", { method: "create_game", game_name : game_name  }, function( response ){
      console.log( response );
      self.gameList = response;
      self.render();
    })
  }
});

var LoginView = Backbone.View.extend({
  events: { 
    "blur .user_name": "checkUserName",
    "click .login-button": "login",
    "click .create-button": "create",
  },
  el: ".logon-view",
  initialize: function(){
    this.render();
  },
  render:function(){
    this.$el.empty().html(
      TemplateManager.render("secret_login",{} )
    );
  },  
  checkUserName: function( e ){
    var self = this;
    $input = $(e.target);
    $.getJSON( "secret_h_backing.php", { method: "checkUserName", user_name: $input.val() }, function( response ){
      if( response.length === 0 ){
        self.$el.find(".create-button").show();
        self.$el.find(".login-button").hide();
      }
      else{
        self.$el.find(".create-button").hide();
        self.$el.find(".login-button").show();
      }
    })
  },
  login: function( e ){
    e.preventDefault();
    var self = this;
    $.post("secret_h_backing.php", { method:"login", user_name: this.$el.find(".user_name").val(), password: this.$el.find(".password").val()}, function( response ){
        _gameListView = new GameListView( response );
        self.hide();
    });
  },
  create: function( e ){
    e.preventDefault();
    var self = this;
     $.post("secret_h_backing.php", { method:"create", user_name: this.$el.find(".user_name").val(), password: this.$el.find(".password").val()}, function( response ){
        _gameView = new GameView( response );
       self.hide();
     });
  },
  hide: function( e ) {
    this.$el.hide();
  }
});



$(function(){
  $.getJSON("templates.php",{ }, function( templates ){
    TemplateManager.initialize(templates);
    _logonView = new LoginView();
  });
});