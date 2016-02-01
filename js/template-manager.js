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