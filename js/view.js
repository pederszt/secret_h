Handlebars.registerHelper('ingredient_measure', function( object, obj2 ){
  console.log( object, obj2 );
  var amount = parseFloat( object.amount );
  if( amount == 1 ){
    return object.measure_abbr;
  }
  return object.measure_plural_abbr;
});
var _mainView, _recipeList, _recipeView, _recipeEditView = null;

var Recipe = Backbone.Model.extend({
  initialize: function(args ) {
   _.extend(this, args )
  },
  name: null,
  url: "recipe-backing.php",
  ingredients: [],
  addIngredient: function( ingredient ) {
    ingredients.push( ingredient );
  }
});

var Ingredient = Backbone.Model.extend({
  item: null,
  amount: 0,
  measure: "none"
});

var FoodItem = Backbone.Model.extend({
  name: null,
  
});

var Recipes = Backbone.Collection.extend({
  model: Recipe,
  url: "recipe-backing.php",
  modelId: function(attrs) {
    return attrs.recipe_id;
  }
});

var MainView = Backbone.View.extend({
  events:{
    "click .recipe-item a":"selectRecipe",
    "click .add-recipe-item a":"addRecipeItem"
  },
  el:".main-view",
  initialize: function(){
    _recipeList.on('change reset add remove sync',this.render, this );
  },
  render: function(){
    this.$el.empty().html( TemplateManager.render("recipe_list", _recipeList.toJSON() ));
  },
  addRecipe:function( recipe ){
    _recipeList.create( 
      recipe, 
      {
        success:function(model, response){
          model.recipe_id = response.recipe_id;
        }
      });
  },
  addRandomRecipe:function(){
    this.addRecipe( new Recipe({recipe_name: "RECIPE " + (new Date()).getTime(), recipe_desc: "Recipe description goes here"} ) );
  },
  selectRecipe: function( e ){
    this.$el.find("li.recipe-item").removeClass("active");
    
    $li = $(e.target).parent();
    $li.addClass("active")
    _recipeView.setRecipe( 
      _recipeList.get( $li.data().id ) 
    );
  },
  addRecipeItem: function( e ){
    _recipeEditView.setRecipe( null );
  }
});

var RecipeView = Backbone.View.extend({
  events:{   
    'click .recipe-edit': "editRecipe"
  },
  el:".recipe-view",
  recipe: null,
  initialize: function(){
    
  },
  render:function(){
    this.$el.empty().html(
      TemplateManager.render("recipe_view", this.recipe.toJSON() )
    );
  },
  setRecipe: function( recipe ){
    _recipeEditView.reset();
    this.recipe = recipe;
    this.render();
  },
  editRecipe: function( e ){
    _recipeEditView.setRecipe( this.recipe );
  },
  reset: function(){
    this.$el.empty();
  }
});

var RecipeEditView = Backbone.View.extend({
  events:{
    'click .cancel': 'cancel',
    'click .save': 'save',
    'click .add-ingredient': 'addIngredient',
  },
  el:".recipe-edit-view",
  recipe: null,
  initialize: function(){
    
  },
  render:function(){
    var json = null;
    if( this.recipe )
      json = this.recipe.toJSON();
    this.$el.empty().append(TemplateManager.render("recipe_edit", json ) );
  },
  setRecipe: function( recipe ){
    _recipeView.reset();
    this.recipe = recipe;
    this.render();
  },
  cancel: function( e ){
    e.preventDefault();
    this.$el.empty();
  },
  save: function( e ){
    e.preventDefault();
    var arr = this.$el.find("form").serializeArray();
    var data = _(arr).reduce(function(acc, field){
      acc[field.name] = field.value;
      return acc;
    },{});
    
    var recipe = null;
    if( data.recipe_id !== ""){
      recipe = _recipeList.get( data.recipe_id );
      recipe.save( data );
    }
    else{
      _mainView.addRecipe( new Recipe(data) );
    }
    
    this.$el.empty();
  },
  reset: function(){
    this.$el.empty();
  },
  addIngredient: function(){
    $tr = $( TemplateManager.render( "ingredient_add", {} ) ).appendTo( this.$el.find("table tbody") );    
  }
});

var TemplateManager = {
  initialize: function( map ){
    this.map = {}
    for( var key in map ){
      this.map[key] = Handlebars.compile( map[key] );
    }
    console.log( this.map );
  },
  render: function( templateName, json ){
    if( this.map[templateName]){
      return this.map[templateName]( json );
    }
    else{
      console.log( "Template  Not found " + templateName );
    }
  }
};

$(function(){
  $.getJSON("templates.php",{ }, function( templates ){
    TemplateManager.initialize(templates);
    _recipeList = new Recipes();
    _mainView = new MainView();
    _recipeView = new RecipeView();
    _recipeEditView = new RecipeEditView();
    _recipeList.fetch({error: function(err){console.log(err);}});
  });
});