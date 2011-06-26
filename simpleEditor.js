/* simpleEditor
 * Copyright 2011 ncloud
 *
 * simpleEditor is distributed under the terms of the MIT license
 * from NicEdit http://nicedit.com (MIT license)
 */

var bkExtend = function(){
	var args = arguments;
	if (args.length == 1) args = [this, args[0]];
	for (var prop in args[1]) args[0][prop] = args[1][prop];
	return args[0];
};
function bkClass() {}
bkClass.prototype.construct = function() {};
bkClass.extend = function(def) {
  var classDef = function() {
      if (arguments[0] !== bkClass) { return this.construct.apply(this, arguments); }
  };
  var proto = new this(bkClass);
  bkExtend(proto,def);
  classDef.prototype = proto;
  classDef.extend = this.extend;      
  return classDef;
};

var bkLib = {
	addEvent : function(obj, type, fn) {
		$(obj).bind("on"+type, fn);	
	},
	
	toArray : function(iterable) {
		var length = iterable.length, results = new Array(length);
    	while (length--) { results[length] = iterable[length] };
    	return results;	
	},
	
	noSelect : function(element) {
		if(element.length == 0) return;

		if(element[0].nodeName.toLowerCase() != 'input' && element[0].nodeName.toLowerCase() != 'textarea') {
			element.attr('unselectable','on');
		}
		element.children().each(function(i, item) {
			bkLib.noSelect($(item));
		});
	},
	camelize : function(s) {
		return s.replace(/\-(.)/g, function(m, l){return l.toUpperCase()});
	},
	inArray : function(arr,item) {
	    return (bkLib.search(arr,item) != null);
	},
	search : function(arr,itm) {
		for(var i=0; i < arr.length; i++) {
			if(arr[i] == itm)
				return i;
		}
		return null;	
	},
	cancelEvent : function(e) {
		e = e || window.event;
		if(e.preventDefault && e.stopPropagation) {
			e.preventDefault();
			e.stopPropagation();
		}
		return false;
	}
};

var bkEvent = {
	addEvent : function(evType, evFunc) {
		if(evFunc) {
			this.eventList = this.eventList || {};
			this.eventList[evType] = this.eventList[evType] || [];
			this.eventList[evType].push(evFunc);
		}
		return this;
	},
	fireEvent : function() {
		var args = bkLib.toArray(arguments), evType = args.shift();
		if(this.eventList && this.eventList[evType]) {
			for(var i=0;i<this.eventList[evType].length;i++) {
				this.eventList[evType][i].apply(this,args);
			}
		}
	}	
};

function __(s) {
	return s;
}

Function.prototype.closure = function() {
  var __method = this, args = bkLib.toArray(arguments), obj = args.shift();
  return function() { if(typeof(bkLib) != 'undefined') { return __method.apply(obj,args.concat(bkLib.toArray(arguments))); } };
}
	
Function.prototype.closureListener = function() {
  	var __method = this, args = bkLib.toArray(arguments), object = args.shift(); 
  	return function(e) { 
  	e = e || window.event;
  	if(e.target) { var target = e.target; } else { var target =  e.srcElement };
	  	return __method.apply(object, [e,target].concat(args) ); 
	};
}		


/* START CONFIG */

var simpleEditorConfig = bkClass.extend({
	buttons : {
		'bold' : {name : __('클릭하시면 글자를 굵게합니다.'), command : 'Bold', tags : ['B','STRONG'], css : {'font-weight' : 'bold'}, key : 'b'},
		'italic' : {name : __('클릭하시면 글자를 기울입니다.'), command : 'Italic', tags : ['EM','I'], css : {'font-style' : 'italic'}, key : 'i'},
		'underline' : {name : __('클릭하시면 글자에 밑줄을 표시합니다.'), command : 'Underline', tags : ['U'], css : {'text-decoration' : 'underline'}, key : 'u'},
		'left' : {name : __('왼쪽 정렬'), command : 'justifyleft', noActive : true},
		'center' : {name : __('가운데 정렬'), command : 'justifycenter', noActive : true},
		'right' : {name : __('오른쪽 정렬'), command : 'justifyright', noActive : true},
		'justify' : {name : __('좌우 정렬'), command : 'justifyfull', noActive : true},
		'ol' : {name : __('블릿 목록'), command : 'insertorderedlist', tags : ['OL']},
		'ul' : 	{name : __('숫자 목록'), command : 'insertunorderedlist', tags : ['UL']},
		'subscript' : {name : __('Click to Subscript'), command : 'subscript', tags : ['SUB']},
		'superscript' : {name : __('Click to Superscript'), command : 'superscript', tags : ['SUP']},
		'strikethrough' : {name : __('Click to Strike Through'), command : 'strikeThrough', css : {'text-decoration' : 'line-through'}},
		'removeformat' : {name : __('Remove Formatting'), command : 'removeformat', noActive : true},
		'indent' : {name : __('Indent Text'), command : 'indent', noActive : true},
		'outdent' : {name : __('Remove Indent'), command : 'outdent', noActive : true},
		'hr' : {name : __('Horizontal Rule'), command : 'insertHorizontalRule', noActive : true},
		'separator' : {name : __('구분자')}
	},
	iconsPath : '../../img/plugin/simpleEditorIcons.gif',
	contentClass : '',
	buttonList : ['save','bold','italic','underline','left','center','right','justify','ol','ul','fontSize','fontFamily','fontFormat','indent','outdent','image','upload','link','unlink','forecolor','bgcolor'],
	iconList : {"bgcolor":1,"forecolor":2,"bold":3,"center":4,"hr":5,"indent":6,"italic":7,"justify":8,"left":9,"ol":10,"outdent":11,"removeformat":12,"right":13,"save":24,"strikethrough":15,"subscript":16,"superscript":17,"ul":18,"underline":19,"image":20,"link":21,"unlink":22,"close":23,"arrow":25,"separator":26},
	notEmpty : true
	
});
/* END CONFIG */


var simpleEditors = {
	simplePlugins : [],
	editors : [],

	registerPlugin : function(plugin,options) {
		this.simplePlugins.push({p : plugin, o : options});
	},

	allTextAreas : function(simpleOptions) {
		var textareas = document.getElementsByTagName("textarea");
		for(var i=0;i<textareas.length;i++) {
			simpleEditors.editors.push(new simpleEditor(simpleOptions).panelInstance(textareas[i]));
		}
		return simpleEditors.editors;
	},
	
	findEditor : function(e) {
		var editors = simpleEditors.editors;
		for(var i=0;i<editors.length;i++) {
			var instance = editors[i].instanceById(e)
			if(instance) {
				return instance;
			}
		}
	}
};


var simpleEditor = bkClass.extend({
	construct : function(o) {
		this.options = new simpleEditorConfig();
		bkExtend(this.options,o);
		this.simpleInstances = new Array();
		this.loadedPlugins = new Array();
		
		var plugins = simpleEditors.simplePlugins;
		for(var i=0;i<plugins.length;i++) {
			this.loadedPlugins.push(new plugins[i].p(this,plugins[i].o));
		}
		simpleEditors.editors.push(this);
		bkLib.addEvent(document.body,'mousedown', this.selectCheck.closureListener(this) );
	},
	
	panelInstance : function(e,o) {
		e = this.checkReplace($(e));
		this.wrap = $('<DIV>').addClass('simpleEditor_wrap');
		e.before(this.wrap);
		var panelElm = $('<DIV>').css('width',(parseInt(e.css('width')) || e.clientWidth)+'px').appendTo(this.wrap).addClass('simpleEditor_panelWrap');
		this.setPanel(panelElm);
		return this.addInstance(e,o);	
	},

	checkReplace : function(e) {
		var r = simpleEditors.findEditor(e);
		if(r) {
			r.removeInstance(e);
			r.removePanel();
		}
		return e;
	},

	addInstance : function(e,o) {
		e = this.checkReplace($(e));

		if( e[0].contentEditable || !!window.opera ) {
			var newInstance = new simpleEditorInstance(e,o,this);
		} else {
			var newInstance = new simpleEditorIFrameInstance(e,o,this);
		}
		this.simpleInstances.push(newInstance);
		
		/*e.parents('form').submit(function() {
			e.html(newInstance.getContent());
		});*/
		return this;
	},
	
	removeInstance : function(e) {
		e = $(e);
		var instances = this.simpleInstances;
		for(var i=0;i<instances.length;i++) {	
			if(instances[i].e == e) {
				instances[i].remove();
				this.simpleInstances.splice(i,1);
			}
		}
	},

	removePanel : function(e) {
		if(this.simplePanel) {
			this.simplePanel.remove();
			this.simplePanel = null;
		}	
	},

	instanceById : function(e) {
		e = $(e);

		var instances = this.simpleInstances;
		for(var i=0;i<instances.length;i++) {
			if(instances[i].e[0] == e[0]) {
				return instances[i];
			}
		}	
	},

	setPanel : function(e) {
		this.simplePanel = new simpleEditorPanel($(e),this.options,this);
		this.fireEvent('panel',this.simplePanel);
		return this;
	},
	
	simpleCommand : function(cmd,args) {	
		if(this.selectedInstance) {
			this.selectedInstance.simpleCommand(cmd,args);
		}
	},
	
	getIcon : function(iconName,options) {
		var icon = this.options.iconList[iconName];
		var file = (options.iconFiles) ? options.iconFiles[iconName] : '';
		return {backgroundImage : "url('"+((icon) ? this.options.iconsPath : file)+"')", backgroundPosition : ((icon) ? ((icon-1)*-18) : 0)+'px 0px'};	
	},
		
	selectCheck : function(e,t) {
		var found = false;
		do{
			if(t.className && t.className.indexOf('simpleEditor') != -1) {
				return false;
			}
		} while(t = t.parentNode);
		this.fireEvent('blur',this.selectedInstance,t);
		this.lastSelectedInstance = this.selectedInstance;
		this.selectedInstance = null;
		return false;
	}
	
});
simpleEditor = simpleEditor.extend(bkEvent);

 
var simpleEditorInstance = bkClass.extend({
	isSelected : false,
	
	construct : function(e,options,simpleEditor) {
		this.ne = simpleEditor;
		this.elm = this.e = e;
		this.options = options || {};

		newX = parseInt(e.css('width')) || e.clientWidth;
		newY = parseInt(e.css('height')) || e.clientHeight;
		this.initialHeight = newY-8;

		if(e.length > 0) {
			var isTextarea = (e[0].nodeName.toLowerCase() == "textarea");
			if(isTextarea || this.options.hasPanel) {
				var ie7s = ($.browser.msie && !((typeof document.body.style.maxHeight != "undefined") && document.compatMode == "CSS1Compat"))
				var s = {width: newX+'px' };
				s[(ie7s) ? 'height' : 'maxHeight'] = (this.ne.options.maxHeight) ? this.ne.options.maxHeight+'px' : null;
				this.editorContain = $('<DIV>').css(s).addClass('simpleEditor_mainWrap').appendTo(this.ne.wrap);
				var editorElm = $('<DIV>').css({width : (newX-8)+'px', minHeight : newY+'px'}).addClass(this.ne.options.contentClass).addClass('simpleEditor_main').appendTo(this.editorContain);

				e.css({display : 'none'});

				editorElm.html(e.html());	
				
				if(isTextarea) {
					editorElm.html(e.val());
					this.copyElm = e;
					var f = e.parents('FORM');
					if(f) { f.bind('submit', this.saveContent.closure(this)); }
				}
				editorElm.css((ie7s) ? {height : newY+'px'} : {overflow: 'hidden'});
				this.elm = editorElm;	
			}
			this.ne.addEvent('blur',this.blur.closure(this));
		}

		this.init();
		this.blur();
	},
	
	init : function() {
		this.elm.attr('contentEditable','true');
	
		if(this.getContent() == "") {
			this.setContent('<br />');
		}
		this.instanceDoc = document.defaultView;

		this.elm.bind('mousedown',this.selected.closureListener(this)).bind('keypress',this.keyDown.closureListener(this)).bind('focus',this.selected.closure(this)).bind('blur',this.blur.closure(this)).bind('keyup',this.selected.closure(this));
		this.ne.fireEvent('add',this);
	},
	
	remove : function() {
		this.saveContent();
		if(this.copyElm || this.options.hasPanel) {
			this.editorContain.remove();
			this.e.css({'display' : 'block'});
			this.ne.removePanel();
		}
		this.disable();
		this.ne.fireEvent('remove',this);
	},
	
	disable : function() {
		this.elm.attr('contentEditable','false');
	},

	focus : function() {
		this.elm.focus();
		return this;
	},
	select : function() {
		this.elm.select();
		return this;
	},	
	getSel : function() {
		return (window.getSelection) ? window.getSelection() : document.selection;	
	},
	
	getRng : function() {
		var s = this.getSel();
		if(!s) { return null; }
		 if (s.rangeCount > 0) {
			rng = s.getRangeAt(0);
		} else if ( typeof s.createRange === 'undefined' ) {
			rng = document.createRange();
		} else {
			rng = s.createRange(); 
		} 
		return rng;
	},
	
	selRng : function(rng,s) {
		if(window.getSelection) {
			s.removeAllRanges();
			s.addRange(rng);
		} else {
			rng.select();
		}
	},
	
	selElm : function() {
		var r = this.getRng();
		if(r.startContainer) {
			var contain = r.startContainer;
			if(r.cloneContents().childNodes.length == 1) {
				for(var i=0;i<contain.childNodes.length;i++) {	
					var rng = contain.childNodes[i].ownerDocument.createRange();
					rng.selectNode(contain.childNodes[i]);					
					if(r.compareBoundaryPoints(Range.START_TO_START,rng) != 1 && 
						r.compareBoundaryPoints(Range.END_TO_END,rng) != -1) {
						return $(contain.childNodes[i]);
					}
				}
			}
			return $(contain);
		} else {
			return $((this.getSel().type == "Control") ? r.item(0) : r.parentElement());
		}
	},
	
	saveRng : function() {
		this.savedRange = this.getRng();
		this.savedSel = this.getSel();
	},
	
	restoreRng : function() {
		if(this.savedRange) {
			this.selRng(this.savedRange,this.savedSel);
		}
	},
	
	keyDown : function(e,t) {
		if(e.ctrlKey) {
			this.ne.fireEvent('key',this,e);
		}
	},
	
	selected : function(e,t) {
		if(!t) {t = this.selElm()}
		if(!e.ctrlKey) {
			var selInstance = this.ne.selectedInstance;
			if(selInstance != this) {
				if(selInstance) {
					this.ne.fireEvent('blur',selInstance,t);
				}
				this.ne.selectedInstance = this;	

				this.ne.fireEvent('focus',selInstance,t);
			}
			this.ne.fireEvent('selected',selInstance,t);
			this.isFocused = true;
			
			if(this.elm.height() < 100) {
				this.elm.animate({height:100+"px"});
			}
			
			this.elm.addClass('simpleEditor_selected');
		}
		return true;
	},
	
	blur : function() {
		this.isFocused = false;
		this.elm.removeClass('simpleEditor_selected');
	},
	
	saveContent : function() {
		if(this.copyElm || this.options.hasPanel) {
			this.ne.fireEvent('save',this);
			(this.copyElm) ? this.copyElm.val(this.getContent()) : this.e.html(this.getContent());

			if(this.ne.options.notEmpty) {
				if(this.getContentText().length == 0) return false;
				else return true;
			} else {
				return true;
			}
		}	
	},
	
	getElm : function() {
		return this.elm;
	},

	getContentText : function() {
		this.content = this.getElm().text();
		this.ne.fireEvent('get',this);
		return this.content;
	},
	
	getContent : function() {
		this.content = this.getElm().html();
		this.ne.fireEvent('get',this);
		return this.content;
	},
	
	setContent : function(e) {
		this.content = e;
		this.ne.fireEvent('set',this);
		this.elm.html(this.content);	
	},
	
	simpleCommand : function(cmd,args) {
		document.execCommand(cmd,false,args);
	}		
});

var simpleEditorIFrameInstance = simpleEditorInstance.extend({
	savedStyles : [],
	
	init : function() {	
		var c = this.elm.html().replace(/^\s+|\s+$/g, '');
		this.elm.html('');
		(!c) ? c = "<br />" : c;
		this.initialContent = c;
		
		this.elmFrame = $('<IFRAME>').attr({'src' : 'javascript:;', 'frameBorder' : 0, 'allowTransparency' : 'true', 'scrolling' : 'no'}).css({height: '100px', width: '100%'}).addClass('simpleEditor_frame').appendTo(this.elm);

		if(this.copyElm) { this.elmFrame.css({width : (this.elm.offsetWidth-4)+'px'}); }
		
		var styleList = ['font-size','font-family','font-weight','color'];
		for(itm in styleList) {
			this.savedStyles[bkLib.camelize(itm)] = this.elm.css(itm);
		}
     	
		setTimeout(this.initFrame.closure(this),50);
	},
	
	disable : function() {
		this.elm.html(this.getContent());
	},
	
	focus : function() {
		this.elm.focus();
		return this;
	},
	
	select : function() {
		this.elm.select();
		return this;
	},

	initFrame : function() {
		var fd = $(this.elmFrame.contentWindow.document);
		fd.designMode = "on";		
		fd.open();
		var css = this.ne.options.externalCSS;
		fd.write('<html><head>'+((css) ? '<link href="'+css+'" rel="stylesheet" type="text/css" />' : '')+'</head><body id="simpleEditorContent" style="margin: 0 !important; background-color: transparent !important;">'+this.initialContent+'</body></html>');
		fd.close();
		this.frameDoc = fd;

		this.frameWin = $(this.elmFrame.contentWindow);
		this.frameContent = $(this.frameWin.document.body).css(this.savedStyles);
		this.instanceDoc = this.frameWin.document.defaultView;
		
		this.heightUpdate();
		this.frameDoc.bind('mousedown', this.selected.closureListener(this)).bind('keyup',this.heightUpdate.closureListener(this)).bind('keydown',this.keyDown.closureListener(this)).bind('keyup',this.selected.closure(this));
		this.ne.fireEvent('add',this);
	},
	
	getElm : function() {
		return this.frameContent;
	},
	
	setContent : function(c) {
		this.content = c;
		this.ne.fireEvent('set',this);
		this.frameContent.html(this.content);	
		this.heightUpdate();
	},
	
	getSel : function() {
		return (this.frameWin) ? this.frameWin.getSelection() : this.frameDoc.selection;
	},
	
	heightUpdate : function() {	
		this.elmFrame.style.height = Math.max(this.frameContent.offsetHeight,this.initialHeight)+'px';
	},
    
	simpleCommand : function(cmd,args) {
		this.frameDoc.execCommand(cmd,false,args);
		setTimeout(this.heightUpdate.closure(this),100);
	}

	
});
var simpleEditorPanel = bkClass.extend({
	construct : function(e,options,simpleEditor) {
		this.elm = e;
		this.options = options;
		this.ne = simpleEditor;
		this.panelButtons = new Array();
		this.buttonList = bkExtend([],this.ne.options.buttonList);
		
		this.panelContain = $('<DIV>').addClass('simpleEditor_panelContain');
		this.panelElm = $('<DIV>').addClass('simpleEditor_panel').appendTo(this.panelContain);	

		this.panelContain.appendTo(e);

		var opt = this.ne.options;
		
		for(var i=0;i<this.buttonList.length;i++) {
			var button = this.buttonList[i];
			this.addButton2(button,opt,true);
		}
		this.reorder();
		bkLib.noSelect(e);	
	},
	
	addButton2 : function(buttonName,options,noOrder) {
		var buttons = options.buttons;
		var button = options.buttons[buttonName];	
		if(typeof(button) == 'undefined') return;

		var type = (button['type']) ? eval('(typeof('+button['type']+') == "undefined") ? null : '+button['type']+';') : simpleEditorButton;
		new type(this.panelElm,buttonName,options,this.ne);
	},

	addButton : function(buttonName,options,noOrder) {
		var button = options.buttons[buttonName];
		var type = (button['type']) ? eval('(typeof('+button['type']+') == "undefined") ? null : '+button['type']+';') : simpleEditorButton;
		var hasButton = bkLib.inArray(this.buttonList,buttonName);

		if(type && (hasButton || this.ne.options.fullPanel)) {
			this.panelButtons.push(new type(this.panelElm,buttonName,options,this.ne));
			if(!hasButton) {	
				this.buttonList.push(buttonName);
			}
		}
	},
	
	findButton : function(itm) {
		for(var i=0;i<this.panelButtons.length;i++) {
			if(this.panelButtons[i].name == itm)
				return this.panelButtons[i];
		}	
	},
	
	reorder : function() {
		var bl = this.buttonList;
	
		for(var i=0;i<bl.length;i++) {
			var button = this.findButton(bl[i]);
			if(button) {
				this.panelElm.append(button.margin);
			}
		}	
	},
	
	remove : function() {
		this.elm.remove();
	}
});
var simpleEditorButton = bkClass.extend({
	
	construct : function(e,buttonName,options,simpleEditor) {
		this.options = options.buttons[buttonName];
		this.name = buttonName;
		this.ne = simpleEditor;
		this.elm = e;

		this.margin = $('<DIV>').appendTo(e).addClass('simpleEditor_buttonWrap');
		
		if(buttonName == 'separator') {		
			this.contain = $('<DIV>').addClass('simpleEditor_buttonContain').appendTo(this.margin);
			this.border = $('<DIV>').appendTo(this.contain);
			this.button = $('<DIV>').addClass('simpleEditor_separator').css(this.ne.getIcon(buttonName,options)).appendTo(this.border);
		} else {
			this.contain = $('<DIV>').addClass('simpleEditor_buttonContain').appendTo(this.margin);
			this.border = $('<DIV>').appendTo(this.contain);
			this.button = $('<DIV>').addClass('simpleEditor_button').css(this.ne.getIcon(buttonName,options)).appendTo(this.border);
			this.button.bind('mouseover', this.hoverOn.closure(this)).bind('mouseout',this.hoverOff.closure(this)).bind('mousedown',this.mouseClick.closure(this))
			
			bkLib.noSelect(this.button);
			
			if(!window.opera) {
				this.button.bind('mousedown', bkLib.cancelEvent);
				this.button.bind('click', bkLib.cancelEvent);
			}
	
			simpleEditor.addEvent('selected', this.enable.closure(this)).addEvent('blur', this.disable.closure(this)).addEvent('key',this.key.closure(this));
		}
		
		this.disable();
		this.init();
	},
	
	init : function() {  },
	
	hide : function() {
		this.contain.css({display : 'none'});
	},
	
	updateState : function() {
		if(this.isDisabled) { this.setBg(); }
		else if(this.isHover) { this.setBg('hover'); }
		else if(this.isActive) { this.setBg('active'); }
		else { this.setBg(); }
	},
	
	setBg : function(state) {
		if(typeof(state) == 'undefined') state = 'normal';
		this.border.removeClass();
		this.border.addClass('simpleEditor_button_'+state);
	},
	
	checkNodes : function(e) {
		var elm = e;	
		do {
			if(this.options.tags && bkLib.inArray(this.options.tags,elm.nodeName)) {
				this.activate();
				return true;
			}
		} while(elm = elm.parentNode && elm.className != "simpleEditor");
		elm = $(e);
		while(elm.nodeType == 3) {
			elm = $(elm.parentNode);
		}
		if(this.options.css) {
			for(itm in this.options.css) {
				if(elm.css(itm,this.ne.selectedInstance.instanceDoc) == this.options.css[itm]) {
					this.activate();
					return true;
				}
			}
		}
		this.deactivate();
		return false;
	},
	
	activate : function() {
		if(!this.isDisabled) {
			this.isActive = true;
			this.updateState();	
			this.ne.fireEvent('buttonActivate',this);
		}
	},
	
	deactivate : function() {
		this.isActive = false;
		this.updateState();	
		if(!this.isDisabled) {
			this.ne.fireEvent('buttonDeactivate',this);
		}
	},
	
	enable : function(ins,t) {
		this.isDisabled = false;
		this.contain.css({'opacity' : 1}).addClass('simpleEditor_buttonEnabled');
		this.updateState();
		this.checkNodes(t);
	},
	
	disable : function(ins,t) {		
		this.isDisabled = true;
		this.contain.css({'opacity' : 0.4}).removeClass('simpleEditor_buttonEnabled');
		this.updateState();	
	},
	
	toggleActive : function() {
		(this.isActive) ? this.deactivate() : this.activate();	
	},
	
	hoverOn : function() {
		if(!this.isDisabled) {
			this.isHover = true;
			this.updateState();
			this.ne.fireEvent("buttonOver",this);
		}
	}, 
	
	hoverOff : function() {
		this.isHover = false;
		this.updateState();
		this.ne.fireEvent("buttonOut",this);
	},
	
	mouseClick : function() {
		if(this.options.command) {
			this.ne.simpleCommand(this.options.command,this.options.commandArgs);
			if(!this.options.noActive) {
				this.toggleActive();
			}
		}
		this.ne.fireEvent("buttonClick",this);
	},
	
	key : function(simpleInstance,e) {
		if(this.options.key && e.ctrlKey && String.fromCharCode(e.keyCode || e.charCode).toLowerCase() == this.options.key) {
			this.mouseClick();
			if(e.preventDefault) e.preventDefault();
		}
	}
	
});

 
var simplePlugin = bkClass.extend({
	
	construct : function(simpleEditor,options) {
		this.options = options;
		this.ne = simpleEditor;
		this.ne.addEvent('panel',this.loadPanel.closure(this));
		
		this.init();
	},

	loadPanel : function(np) {
		var buttons = this.options.buttons;
		for(var button in buttons) {
			np.addButton(button,this.options);
		}
		np.reorder();
	},

	init : function() {  }
});



 
 /* START CONFIG */
var simplePaneOptions = { };
/* END CONFIG */

var simpleEditorPane = bkClass.extend({
	construct : function(elm,simpleEditor,options,openButton) {
		this.ne = simpleEditor;
		this.elm = elm;
		this.pos = elm.offset();
		//this.pos.top += this.ne.selectedInstance.editorContain.height() + 24; // 에디터의 하단에 표시
		
		this.contain = $('<DIV>').css({zIndex : '99999', overflow : 'hidden', position : 'absolute', top : (this.pos.top - 8) + 'px'})
		this.pane = $('<DIV>').css({fontSize : '12px', border : '1px solid #ccc', 'overflow': 'hidden', padding : '4px', textAlign: 'left', backgroundColor : '#ffffc9'}).addClass('simpleEditor_pane').css(options).appendTo(this.contain);
		
		if(openButton && !openButton.options.noClose) {
			this.close = $('<DIV>').css({'float' : 'right', height: '16px', width : '16px', cursor : 'pointer'}).css(this.ne.getIcon('close',simplePaneOptions)).bind('mousedown',openButton.removePane.closure(this)).appendTo(this.pane);
		}
		
		bkLib.noSelect(this.contain);
		this.contain.appendTo(document.body);
		
		this.position();
		this.init();	
	},
	
	init : function() { },
	
	position : function() {
		if(this.ne.simplePanel) {
			var panelElm = this.ne.simplePanel.elm;	
			var newLeft = parseInt(panelElm.width())-(this.pane.width()) - 1;
			this.contain.css({left : newLeft+'px'});
		}
	},
	
	toggle : function() {
		this.isVisible = !this.isVisible;
		this.contain.css({display : ((this.isVisible) ? 'block' : 'none')});
	},
	
	remove : function() {
		if(this.contain) {
			this.contain.remove();
			this.contain = null;
		}
	},
	
	append : function(c) {
		c.appendTo(this.pane);
	},
	
	setContent : function(c) {
		this.pane.html(c);	
		this.position();
	}
	
});


 
var simpleEditorAdvancedButton = simpleEditorButton.extend({
	
	init : function() {
		this.ne.addEvent('selected',this.removePane.closure(this)).addEvent('blur',this.removePane.closure(this));	
	},
	
	mouseClick : function() {
		if(!this.isDisabled) {
			if(this.pane && this.pane.pane) {
				this.removePane();
			} else {
				this.pane = new simpleEditorPane(this.contain,this.ne,{width : (this.width || '270px'), backgroundColor : '#fff'},this);
				this.addPane();
				this.ne.selectedInstance.saveRng();
			}
		}
	},
	
	addForm : function(f,elm) {
		this.form = $('<FORM>').bind('submit',this.submit.closureListener(this));
		this.pane.append(this.form);
		this.inputs = {};
		
		for(itm in f) {
			var field = f[itm];
			var val = '';
			if(elm) {
				val = elm.getAttribute(itm);
			}
			if(!val) {
				val = field['value'] || '';
			}
			var type = f[itm].type;
			
			if(type == 'title') {
					$('<DIV>').html(field.txt).css({fontSize : '14px', fontWeight: 'bold', padding : '0px', margin : '2px 0'}).appendTo(this.form);
			} else {
				var contain = $('<DIV>').css({overflow : 'hidden', clear : 'both'}).appendTo(this.form);
				if(field.txt) {
					$('<LABEL>').attr({'for' : itm}).html(field.txt).css({margin : '2px 4px', fontSize : '13px', width: '50px', lineHeight : '20px', textAlign : 'right', 'float' : 'left'}).appendTo(contain);
				}
				
				switch(type) {
					case 'text':
						this.inputs[itm] = $('<INPUT>').attr({id : itm, 'value' : val, 'type' : 'text'}).css({margin : '2px 0', fontSize : '13px', 'float' : 'left', height : '20px', border : '1px solid #ccc', overflow : 'hidden'}).css(field.style).appendTo(contain);
						break;
					case 'select':
						this.inputs[itm] = $('<SELECT>').attr({id : itm}).css({border : '1px solid #ccc', 'float' : 'left', margin : '2px 0'}).appendTo(contain);
						for(opt in field.options) {
							var o = $('option').attr({value : opt, selected : (opt == val) ? 'selected' : ''}).html(field.options[opt]).appendTo(this.inputs[itm]);
						}
						break;
					case 'content':
						this.inputs[itm] = $('<TEXTAREA>').attr({id : itm}).css({border : '1px solid #ccc', 'float' : 'left'}).css(field.style).appendTo(contain);
						this.inputs[itm].val(val);
				}	
			}
		}
		$('<INPUT>').attr({'type' : 'submit', 'value' : '확인'}).css({backgroundColor : '#efefef',border : '1px solid #ccc', margin : '3px 0', 'float' : 'left', 'clear' : 'both'}).appendTo(this.form);
		this.form.onsubmit = bkLib.cancelEvent;	
	},
	
	submit : function() { },
	
	findElm : function(tag,attr,val) {
		var list = this.ne.selectedInstance.getElm().getElementsByTagName(tag);
		for(var i=0;i<list.length;i++) {
			if(list[i].getAttribute(attr) == val) {
				return $(list[i]);
			}
		}
	},
	
	removePane : function() {
		if(this.pane) {		
			this.pane.remove();
			this.pane = null;
			this.ne.selectedInstance.restoreRng();
		}	
	}	
});


var simpleButtonTips = bkClass.extend({
	construct : function(simpleEditor) {
		this.ne = simpleEditor;
		simpleEditor.addEvent('buttonOver',this.show.closure(this)).addEvent('buttonOut',this.hide.closure(this));

	},
	
	show : function(button) {
		this.timer = setTimeout(this.create.closure(this,button),800);
	},
	
	create : function(button) {
		this.timer = null;
		if(!this.pane) {
			this.pane = new simpleEditorPane(button.button,this.ne,{fontSize : '12px', marginTop : '5px'});
			this.pane.setContent(button.options.name);
		}		
	},
	
	hide : function(button) {
		if(this.timer) {
			clearTimeout(this.timer);
		}
		if(this.pane) {
			this.pane = this.pane.remove();
		}
	}
});
//simpleEditors.registerPlugin(simpleButtonTips);


 
 /* START CONFIG */
var simpleSelectOptions = {
	buttons : {
		'fontSize' : {name : __('Select Font Size'), type : 'simpleEditorFontSizeSelect', command : 'fontsize'},
		'fontFamily' : {name : __('Select Font Family'), type : 'simpleEditorFontFamilySelect', command : 'fontname'},
		'fontFormat' : {name : __('Select Font Format'), type : 'simpleEditorFontFormatSelect', command : 'formatBlock'}
	}
};
/* END CONFIG */
var simpleEditorselect = bkClass.extend({
	
	construct : function(e,buttonName,options,simpleEditor) {
		this.options = options.buttons[buttonName];
		this.elm = e;
		this.ne = simpleEditor;
		this.name = buttonName;
		this.selOptions = new Array();
		
		this.margin = $('<DIV>').css({'float' : 'left', margin : '2px 1px 0 1px'}).appendTo(this.elm);
		this.contain = $('<DIV>').css({width: '90px', height : '20px', cursor : 'pointer', overflow: 'hidden'}).addClass('simpleEditor_selectContain').bind('click',this.toggle.closure(this)).appendTo(this.margin);
		this.items = $('<DIV>').css({overflow : 'hidden', zoom : 1, border: '1px solid #ccc', paddingLeft : '3px', backgroundColor : '#fff'}).appendTo(this.contain);
		this.control = $('<DIV>').css({overflow : 'hidden', 'float' : 'right', height: '18px', width : '16px'}).addClass('simpleEditor_selectControl').css(this.ne.getIcon('arrow',options)).appendTo(this.items);
		this.txt = $('<DIV>').css({overflow : 'hidden', 'float' : 'left', width : '66px', height : '14px', marginTop : '1px', fontFamily : 'sans-serif', textAlign : 'center', fontSize : '12px'}).addClass('simpleEditor_selectTxt').appendTo(this.items);
		
		if(!window.opera) {
			this.contain.onmousedown = this.control.onmousedown = this.txt.onmousedown = bkLib.cancelEvent;
		}
		
		bkLib.noSelect(this.margin);
		
		this.ne.bind('selected', this.enable.closure(this)).bind('blur', this.disable.closure(this));
		
		this.disable();
		this.init();
	},
	
	disable : function() {
		this.isDisabled = true;
		this.close();
		this.contain.css({opacity : 0.6});
	},
	
	enable : function(t) {
		this.isDisabled = false;
		this.close();
		this.contain.css({opacity : 1});
	},
	
	setDisplay : function(txt) {
		this.txt.setContent(txt);
	},
	
	toggle : function() {
		if(!this.isDisabled) {
			(this.pane) ? this.close() : this.open();
		}
	},
	
	open : function() {
		this.pane = new simpleEditorPane(this.items,this.ne,{width : '88px', padding: '0px', borderTop : 0, borderLeft : '1px solid #ccc', borderRight : '1px solid #ccc', borderBottom : '0px', backgroundColor : '#fff'});
		
		for(var i=0;i<this.selOptions.length;i++) {
			var opt = this.selOptions[i];
			var itmContain = $('<DIV>').css({overflow : 'hidden', borderBottom : '1px solid #ccc', width: '88px', textAlign : 'left', overflow : 'hidden', cursor : 'pointer'});
			var itm = $('<DIV>').css({padding : '0px 4px'}).html(opt[1]).appendTo(itmContain)
			bkLib.noSelect(itm);
			itm.bind('click',this.update.closure(this,opt[0])).bind('mouseover',this.over.closure(this,itm)).bind('mouseout',this.out.closure(this,itm)).attr('id',opt[0]);
			this.pane.append(itmContain);
			if(!window.opera) {
				itm.onmousedown = bkLib.cancelEvent;
			}
		}
	},
	
	close : function() {
		if(this.pane) {
			this.pane = this.pane.remove();
		}	
	},
	
	over : function(opt) {
		opt.css({backgroundColor : '#ccc'});			
	},
	
	out : function(opt) {
		opt.css({backgroundColor : '#fff'});
	},
	
	
	add : function(k,v) {
		this.selOptions.push(new Array(k,v));	
	},
	
	update : function(elm) {
		this.ne.simpleCommand(this.options.command,elm);
		this.close();	
	}
});

var simpleEditorFontSizeSelect = simpleEditorselect.extend({
	sel : {1 : '1&nbsp;(8pt)', 2 : '2&nbsp;(10pt)', 3 : '3&nbsp;(12pt)', 4 : '4&nbsp;(14pt)', 5 : '5&nbsp;(18pt)', 6 : '6&nbsp;(24pt)'},
	init : function() {
		this.setDisplay('Font&nbsp;Size...');
		for(itm in this.sel) {
			this.add(itm,'<font size="'+itm+'">'+this.sel[itm]+'</font>');
		}		
	}
});

var simpleEditorFontFamilySelect = simpleEditorselect.extend({
	sel : {'arial' : 'Arial','comic sans ms' : 'Comic Sans','courier new' : 'Courier New','georgia' : 'Georgia', 'helvetica' : 'Helvetica', 'impact' : 'Impact', 'times new roman' : 'Times', 'trebuchet ms' : 'Trebuchet', 'verdana' : 'Verdana'},
	
	init : function() {
		this.setDisplay('Font&nbsp;Family...');
		for(itm in this.sel) {
			this.add(itm,'<font face="'+itm+'">'+this.sel[itm]+'</font>');
		}
	}
});

var simpleEditorFontFormatSelect = simpleEditorselect.extend({
		sel : {'p' : 'Paragraph', 'pre' : 'Pre', 'h6' : 'Heading&nbsp;6', 'h5' : 'Heading&nbsp;5', 'h4' : 'Heading&nbsp;4', 'h3' : 'Heading&nbsp;3', 'h2' : 'Heading&nbsp;2', 'h1' : 'Heading&nbsp;1'},
		
	init : function() {
		this.setDisplay('Font&nbsp;Format...');
		for(itm in this.sel) {
			var tag = itm.toUpperCase();
			this.add('<'+tag+'>','<'+itm+' style="padding: 0px; margin: 0px;">'+this.sel[itm]+'</'+tag+'>');
		}
	}
});

simpleEditors.registerPlugin(simplePlugin,simpleSelectOptions);

/* START CONFIG */
var simpleLinkOptions = {
	buttons : {
		'link' : {name : '링크 추가/수정', type : 'simpleLinkButton', tags : ['A']},
		'unlink' : {name : '링크 삭제',  command : 'unlink', noActive : true}
	}
};
/* END CONFIG */

var simpleLinkButton = simpleEditorAdvancedButton.extend({	
	addPane : function() {
		this.ln = this.ne.selectedInstance.selElm().parentTag('A');
		this.addForm({
			'' : {type : 'title', txt : '링크 추가/수정'},
			'href' : {type : 'text', txt : '주소', value : 'http://', style : {width: '150px'}},
			'title' : {type : 'text', txt : '제목'}
		},this.ln);
	},
	
	submit : function(e) {
		var url = this.inputs['href'].value;
		if(url == "http://" || url == "") {
			alert("You must enter a URL to Create a Link");
			return false;
		}
		this.removePane();
		
		if(!this.ln) {
			var tmp = 'javascript:simpleTemp();';
			this.ne.simpleCommand("createlink",tmp);
			this.ln = this.findElm('A','href',tmp);
		}
		if(this.ln) {
			this.ln.attr({
				href : this.inputs['href'].value,
				title : this.inputs['title'].value,
				target : this.inputs['target'].options[this.inputs['target'].selectedIndex].value
			});
		}
	}
});

simpleEditors.registerPlugin(simplePlugin,simpleLinkOptions);



/* START CONFIG */
var simpleColorOptions = {
	buttons : {
		'forecolor' : {name : __('Change Text Color'), type : 'simpleEditorColorButton', noClose : true},
		'bgcolor' : {name : __('Change Background Color'), type : 'simpleEditorBgColorButton', noClose : true}
	}
};
/* END CONFIG */

var simpleEditorColorButton = simpleEditorAdvancedButton.extend({	
	addPane : function() {
			var colorList = {0 : '00',1 : '33',2 : '66',3 :'99',4 : 'CC',5 : 'FF'};
			var colorItems = $('<DIV>').css({width: '270px'});
			
			for(var r in colorList) {
				for(var b in colorList) {
					for(var g in colorList) {
						var colorCode = '#'+colorList[r]+colorList[g]+colorList[b];
						
						var colorSquare = $('<DIV>').css({'cursor' : 'pointer', 'height' : '15px', 'float' : 'left'}).appendTo(colorItems);
						var colorBorder = $('<DIV>').css({border: '2px solid '+colorCode}).appendTo(colorSquare);
						var colorInner = $('<DIV>').css({backgroundColor : colorCode, overflow : 'hidden', width : '11px', height : '11px'}).bind('click',this.colorSelect.closure(this,colorCode)).bind('mouseover',this.on.closure(this,colorBorder)).bind('mouseout',this.off.closure(this,colorBorder,colorCode)).appendTo(colorBorder);
						
						if(!window.opera) {
							colorSquare.onmousedown = colorInner.onmousedown = bkLib.cancelEvent;
						}

					}	
				}	
			}
			bkLib.noSelect(colorItems);
			this.pane.append(colorItems);	
	},
	
	colorSelect : function(c) {
		this.ne.simpleCommand('foreColor',c);
		this.removePane();
	},
	
	on : function(colorBorder) {
		colorBorder.css({border : '2px solid #000'});
	},
	
	off : function(colorBorder,colorCode) {
		colorBorder.css({border : '2px solid '+colorCode});		
	}
});

var simpleEditorBgColorButton = simpleEditorColorButton.extend({
	colorSelect : function(c) {
		this.ne.simpleCommand('hiliteColor',c);
		this.removePane();
	}	
});

simpleEditors.registerPlugin(simplePlugin,simpleColorOptions);



/* START CONFIG */
var simpleImageOptions = {
	buttons : {
		'image' : {name : 'Add Image', type : 'simpleImageButton', tags : ['IMG']}
	}
	
};
/* END CONFIG */

var simpleImageButton = simpleEditorAdvancedButton.extend({	
	addPane : function() {
		this.im = this.ne.selectedInstance.selElm().parentTag('IMG');
		this.addForm({
			'' : {type : 'title', txt : 'Add/Edit Image'},
			'src' : {type : 'text', txt : 'URL', 'value' : 'http://', style : {width: '150px'}},
			'alt' : {type : 'text', txt : 'Alt Text', style : {width: '100px'}},
			'align' : {type : 'select', txt : 'Align', options : {none : 'Default','left' : 'Left', 'right' : 'Right'}}
		},this.im);
	},
	
	submit : function(e) {
		var src = this.inputs['src'].value;
		if(src == "" || src == "http://") {
			alert("You must enter a Image URL to insert");
			return false;
		}
		this.removePane();

		if(!this.im) {
			var tmp = 'javascript:simpleImTemp();';
			this.ne.simpleCommand("insertImage",tmp);
			this.im = this.findElm('IMG','src',tmp);
		}
		if(this.im) {
			this.im.attr({
				src : this.inputs['src'].value,
				alt : this.inputs['alt'].value,
				align : this.inputs['align'].value
			});
		}
	}
});

simpleEditors.registerPlugin(simplePlugin,simpleImageOptions);


/* START CONFIG */
var simpleSaveOptions = {
	buttons : {
		'save' : {name : __('Save this content'), type : 'simpleEditorsaveButton'}
	}
};
/* END CONFIG */

var simpleEditorsaveButton = simpleEditorButton.extend({
	init : function() {
		if(!this.ne.options.onSave) {
			this.margin.css({'display' : 'none'});
		}
	},
	mouseClick : function() {
		var onSave = this.ne.options.onSave;
		var selectedInstance = this.ne.selectedInstance;
		onSave(selectedInstance.getContent(), selectedInstance.elm.id, selectedInstance);
	}
});

simpleEditors.registerPlugin(simplePlugin,simpleSaveOptions);

/* auto scroll */
var simpleAutoScroll = bkClass.extend({
	construct : function(simpleEditor) {
		this.ne = simpleEditor;

		var $this = this;
		$(window).scroll(function() {
			$this.scrollSidebar();
		});
	},
	scrollSidebar : function() {
		$(".simpleEditor_wrap").each(function(i, wrap) {
				var $wrap = $(wrap);
				var $panel = $wrap.find(".simpleEditor_panelWrap");
				
			    var w_t = $(window).scrollTop();
				var s_t = $wrap.offset().top;
				var s_l = $wrap.offset().left;
				
				if(w_t > s_t) { // 상단에 고정
					$panel.css('position','fixed').css('left',s_l + 'px');
				} else { // 상단에 고정 취소
					$panel.css('position','absolute').css('left','0px').css('top','0px');
				}
		});
	}
});

simpleEditors.registerPlugin(simpleAutoScroll);