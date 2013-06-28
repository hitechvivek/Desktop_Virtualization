/**
 * @fileOverview Common classes and objects used
 * @author Ian Moore (imoore76 at yahoo dot com)
 * @version $Id: phpvirtualbox.js 496 2012-11-02 13:04:44Z imooreyahoo@gmail.com $
 * @copyright Copyright (C) 2010-2012 Ian Moore (imoore76 at yahoo dot com)
 */


/**
 * Host details sections used on details tab
 * 
 * @namespace vboxHostDetailsSections
 */

/**
 * VM details sections used on details tab and snapshot pages
 * 
 * @namespace vboxVMDetailsInfo
 */
var vboxVMDetailsSections = {
	
	/*
	 * General
	 */
	general: {
		icon:'machine_16px.png',
		title:trans('Details','VBoxGlobal'),
		//settingsLink: 'General',
		multiSelectDetailsTable: true,
		rows : [
		   {
			   title: trans('Name', 'VBoxGlobal'),
			   attrib: 'name'
		   },
		   {
			   title: trans('OS Type', 'VBoxGlobal'),
			   attrib: 'OSTypeDesc'
		   },
		   {
			   title: trans('Guest Additions Version'),
			   attrib: 'guestAdditionsVersion'
		   },
		   {
			   title: trans('Groups','UIGDetails'),
			   condition: function(d){
				   return (d.groups.length > 1 || (d.groups.length == 1 && d.groups[0] != '/')); 
			   },
			   callback: function(d) {
				   if(d.groups && d.groups.length > 0)
					   return jQuery.map(d.groups,function(elm) {
						   if(elm.length > 1) return elm.substring(1);
						   return elm;
					   }).join(', ');
			   }
		   }
		   
		]
	},
	
	/*
	 * System
	 */
	system : {
		//icon:'chipset_16px.png',
		//title:trans('System','VBoxGlobal'),
		//settingsLink: 'System',
		//redrawMachineEvents: ['OnCPUExecutionCapChanged'],
		multiSelectDetailsTable: true,
		//rows : [		]
	},
	
	/*
	 * Preview box
	 */
	preview : {
	//	icon:'fullscreen_16px.png',
	//	_resolutionCache : {},
	//	title:trans('Preview'),
	//	settingsLink: 'Display',
		multiSelectDetailsTable: true,
	//	noSnapshot: true,
	//	noFooter: true,
	//	_updateInterval : undefined,
	//	_screenPadding : 0, // padding around actual screenshot in px 
		
		
		/**
		 * Rows wrapper
		 */
		rows : function(d) {

			var timer = $('#vboxPane').data('vboxPreviewTimer-'+d.id);
			if(timer) window.clearInterval(timer);
			$('#vboxPane').data('vboxPreviewTimer-'+d.id, null);
			
			return (isCanvasSupported() ? vboxVMDetailsSections.preview._rows_canvas(d) : vboxVMDetailsSections.preview._rows_html(d));
		},
		
		/**
		 * Draws preview on canvas object
		 */
		_rows_canvas : function(d) {
		
			
			// Create canvas and initially draw VM name
			var previewCanvas = $('<canvas />');
			
			//vboxDrawPreviewCanvas(previewCanvas[0], null, d.name, width, height);
			
			// Draw screenshot if it's running or saved
			
			
			/* Return row */
			return [ {	//data: $('<div />')
					//.attr({'class':'vboxInvisble'})
				//	.append(previewCanvas),
			//rawRow: true
			}];
			
		}
	}
};

/**
 * Common VM Group Actions - most of these are passed off
 * to the vboxChooser object
 * 
 * @namespace vboxVMGroupActions
 */
var vboxVMGroupActions = {

	'newmachine': {
		label: trans('New Machine...','UIActionPool'),
		icon: 'new',
		click: function(){
			vboxVMActions['new'].click(true);
		},
		enabled: function() {
			return $('#vboxPane').data('vboxSession').admin;
		}
	},
	
	addmachine: {
		label: trans('Add Machine...','UIActionPool'),
		icon: 'vm_add',
		click: function() {
			vboxVMActions['add'].click(true);
		},
		enabled: function() {
			return $('#vboxPane').data('vboxSession').admin;
		}
	},
	
	rename: {
		label: trans('Rename Group...','UIActionPool'),
		icon: 'name',
		enabled: function() {
			if(!$('#vboxPane').data('vboxSession').admin) return false;
			var gElm = vboxChooser.getSelectedGroupElements()[0];
			if(!gElm) return false;
			if($('#vboxPane').data('vboxConfig')['phpVboxGroups']) return true;
			if($(gElm).find('td.vboxVMSessionOpen')[0]) return false;
			return true;
		},
		click: function() {
			vboxChooser.renameSelectedGroup();
		}
	},
	
	ungroup: {
		label: trans('Ungroup...','UIActionPool'),
		icon: 'delete',
		enabled: function() {
			if(!$('#vboxPane').data('vboxSession').admin) return false;
			var gElm = vboxChooser.getSelectedGroupElements()[0];
			if(!gElm) return false;
			if($('#vboxPane').data('vboxConfig')['phpVboxGroups']) return true;
			if($(gElm).find('td.vboxVMSessionOpen')[0]) return false;
			return true;
		},
		click: function() {
			
			vboxChooser.unGroupSelectedGroup();
			
		}
	},
	
	'sort': {
		label: trans('Sort','UIActionPool'),
		click: function() {
			vboxChooser.sortSelectedGroup();
		},
		enabled: function() {
			return $('#vboxPane').data('vboxSession').admin;
		}
	}
	
};

/**
 * Common VM Actions - These assume that they will be run on the selected VM as
 * stored in vboxChooser.getSingleSelected()
 * 
 * @namespace vboxVMActions
 */
var vboxVMActions = {
		
	/** Invoke the new virtual machine wizard */
	'new':{
			label:trans('New...','UIActionPool'),
			icon:'vm_new',
			icon_16:'new',
			click: function(fromGroup){
				new vboxWizardNewVMDialog((fromGroup ? $(vboxChooser.getSelectedGroupElements()[0]).data('vmGroupPath') : '')).run();
			}
	},
	
	/** Add a virtual machine via its settings file */
	add: {
		label:trans('Add...','UIActionPool'),
		icon:'vm_add',
		click:function(){
			vboxFileBrowser($('#vboxPane').data('vboxSystemProperties').defaultMachineFolder,function(f){
				if(!f) return;
				var l = new vboxLoader();
				l.add('machineAdd',function(){},{'file':f});
				l.onLoad = function(){
					var lm = new vboxLoader();
					lm.add('vboxGetMedia',function(d){$('#vboxPane').data('vboxMedia',d.responseData);});
					lm.run();
				};
				l.run();
				
			},false,trans('Add an existing virtual machine','UIActionPool'),'images/vbox/machine_16px.png',true);
		}
	},

	/** Start VM */
	start: {
		name : 'start',
		label : trans('Start','UIActionPool'),
		icon : 'vm_start',
		icon_16 : 'start',
		click : function (btn) {
		
			
			// Should the "First Run" wizard be started
			////////////////////////////////////////////
			var firstRun = function(vm) {
				
				var frDef = $.Deferred();
				
				$.when(vboxVMDataMediator.getVMDetails(vm.id)).then(function(d) {

					// Not first run?
					if(d.GUI.FirstRun != 'yes') {
						// Just resolve, nothing to do
						frDef.resolve(d);
						return;
					}

					// Check for CD/DVD drive attachment that has no CD/DVD
					var cdFound = false;
					for(var i = 0; i < d.storageControllers.length; i++) {
						for(var a = 0; a < d.storageControllers[i].mediumAttachments.length; a++) {
							if(d.storageControllers[i].mediumAttachments[a].type == "DVD" &&
									d.storageControllers[i].mediumAttachments[a].medium == null) {
								cdFound = true;
								break;
							}
						}
					}
					
					// No CD/DVD attachment
					if(!cdFound) {
						// Just resolve, nothing to do
						frDef.resolve(d);
						return;	
					}
					
					// First time run
					$.when(d, new vboxWizardFirstRunDialog(d).run()).then(function(vm2start){
						frDef.resolve(vm2start);
					});
					
					
				});
				return frDef.promise();
			};
			
			// Start each eligable selected vm
			//////////////////////////////////////
			var startVMs = function() {				
				
				var vms = vboxChooser.getSelectedVMsData();
				var vmsToStart = [];
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isPaused(vms[i]) || vboxVMStates.isPoweredOff(vms[i]) || vboxVMStates.isSaved(vms[i])) {
						vmsToStart[vmsToStart.length] = vms[i];
					}
					
				}
				
				(function runVMsToStart(vms){
					
					(vms.length && $.when(firstRun(vms.shift())).then(function(vm){

						$.when(vm,vboxAjaxRequest('machineSetState',{'vm':vm.id,'state':'powerUp'})).then(function(evm,d){
							// check for progress operation
							if(d && d.responseData && d.responseData.progress) {
								var icon = null;
								if(vboxVMStates.isSaved(evm)) icon = 'progress_state_restore_90px.png';
								else icon = 'progress_start_90px.png';
								vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(){return;},icon,
										trans('Start the selected virtual machines','UIActionPool'),evm.name);
							}
						});
						
						runVMsToStart(vms);
						
					}));
				})(vmsToStart);
			};
			
			// Check for memory limit
			// Paused VMs are already using all their memory
			if($('#vboxPane').data('vboxConfig').vmMemoryStartLimitWarn) {
				
				var freeMem = 0;
				var baseMem = 0;
				
				// Host memory needs to be checked
				var loadData = [vboxAjaxRequest('hostGetMeminfo')];
				
				// Load details of each machine to get memory info
				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isPoweredOff(vms[i]) || vboxVMStates.isSaved(vms[i]))
						loadData[loadData.length] = vboxVMDataMediator.getVMDataCombined(vms[i].id);
				}
				
				// Show loading screen while this is occuring
				var l = new vboxLoader('vboxHostMemCheck');
				l.showLoading();
				
				// Load all needed data
				$.when.apply($, loadData).then(function() {
					
					// Remove loading screen
					l.removeLoading();

					// First result is host memory info
					freeMem = arguments[0].responseData;
					
					
					// Add memory of each VM
					for(var i = 1; i < arguments.length; i++) {
				
						// Paused VMs are already using their memory
						if(vboxVMStates.isPaused(arguments[i].responseData)) continue;
						
						// memory + a little bit of overhead
						baseMem += (arguments[i].responseData.memorySize + 50);
					}

					// subtract offset
					if($('#vboxPane').data('vboxConfig').vmMemoryOffset)
						freeMem -= $('#vboxPane').data('vboxConfig').vmMemoryOffset;
					
					// Memory breaches warning threshold
					if(baseMem >= freeMem) {
						var buttons = {};
						buttons[trans('Yes','QIMessageBox')] = function(){
							$(this).remove();
							startVMs();
						};
						freeMem = Math.max(0,freeMem);
						vboxConfirm('<p>The selected virtual machine(s) require(s) <b><i>approximately</b></i> ' + baseMem +
								'MB of memory, but your VirtualBox host only has ' + freeMem + 'MB '+
								($('#vboxPane').data('vboxConfig').vmMemoryOffset ? ' (-'+$('#vboxPane').data('vboxConfig').vmMemoryOffset+'MB)': '') +
								' free.</p><p>Are you sure you want to start the virtual machine(s)?</p>',buttons,trans('No','QIMessageBox'));
						
						// Memory is fine. Start vms.
					} else {
						startVMs();
					}
					
				});
				
			// No memory limit warning configured
			} else {
				startVMs();
			}

						
		},
		enabled : function () {
			return (vboxChooser.isSelectedInState('Paused') || vboxChooser.isSelectedInState('PoweredOff') || vboxChooser.isSelectedInState('Saved'));			
		}	
	},
	
	/** Invoke VM settings dialog */
	settings: {
		label:trans('Settings...','UIActionPool'),
		icon:'vm_settings',
		icon_16:'settings',
		click:function(){
			
			vboxVMsettingsDialog(vboxChooser.getSingleSelectedId());
		},
		enabled : function () {
			return vboxChooser && vboxChooser.selectionMode == vboxSelectionModeSingleVM && 
				(vboxChooser.isSelectedInState('Running') || vboxChooser.isSelectedInState('Paused') || vboxChooser.isSelectedInState('Editable'));
		}
	},

	/** Clone a VM */
	clone: {
		label:trans('Clone...','UIActionPool'),
		icon:'vm_clone',
		icon_16:'vm_clone',
		icon_disabled:'vm_clone_disabled',
		click:function(){
			new vboxWizardCloneVMDialog({vm:vboxChooser.getSingleSelected()}).run();
		},
		enabled: function () {
			return (vboxChooser.selectionMode == vboxSelectionModeSingleVM && vboxChooser.isSelectedInState('PoweredOff'));
		}
	},

	
	/** Refresh a VM's details */
	refresh: {
		label:trans('Refresh','UIVMLogViewer'),
		icon:'refresh',
		icon_disabled:'refresh_disabled',
		click:function(){
			
			var vmid = vboxChooser.getSingleSelectedId();
			
			var l = new vboxLoader();
			l.showLoading();
			$.when(vboxVMDataMediator.refreshVMData(vmid)).then(function(){
				l.removeLoading();
			});
			
    	},
    	enabled: function () {return(vboxChooser.selectedVMs.length ==1);}
    },
    
    /** Delete / Remove a VM */
    remove: {
		label:trans('Remove...', 'UIActionPool'),
		icon:'delete',
		click:function(){

			
			var removeVMs = function(keepFiles) {

				var vms = vboxChooser.getSelectedVMsData();
				
				for(var i = 0; i < vms.length; i++) {
					
					if(vboxVMStates.isPoweredOff(vms[i])) {

						// Remove each selected vm
						$.when(vms[i].name, vboxAjaxRequest('machineRemove',
								{'vm':vms[i].id,'delete':(keepFiles ? '0' : '1')}))
							.then(function(vmname, d){
								// check for progress operation
								if(d && d.responseData && d.responseData.progress) {
									vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(){return;},'progress_delete_90px.png',
											trans('Remove the selected virtual machines', 'UIActionPool'), vmname);
								}
						});						
					}
				}				
			};
			
			var buttons = {};
			buttons[trans('Delete all files','UIMessageCenter')] = function(){
				$(this).empty().remove();
				removeVMs(false);
			};
			buttons[trans('Remove only','UIMessageCenter')] = function(){
				$(this).empty().remove();
				removeVMs(true);
			};
			
			
			var vmNames = [];
			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isPoweredOff(vms[i])) {
					vmNames[vmNames.length] = vms[i].name;
				}
			}
			
			if(vmNames.length) {

				vmNames = '<b>'+vmNames.join('</b>, <b>')+'</b>';
				var q = trans('<p>You are about to remove following virtual machines from the machine list:</p><p>%1</p><p>Would you like to delete the files containing the virtual machine from your hard disk as well? Doing this will also remove the files containing the machine\'s virtual hard disks if they are not in use by another machine.</p>','UIMessageCenter').replace('%1',vmNames);
				
				vboxConfirm(q,buttons);
				
			}
			
    	
    	},
    	enabled: function () {
    		return (vboxChooser.isSelectedInState('PoweredOff'));
    	}
    },
    
    /** Create a group from VM * */
    group: {
    	label: trans('Group','UIActionPool'),
    	icon: 'add_shared_folder',
    	icon_disabled: 'add_shared_folder_disabled',
    	click: function() {
    		vboxChooser.groupSelectedItems();
    	},
    	enabled: function() {
    		
    		if(!$('#vboxPane').data('vboxSession').admin)
    			return false;
    		
    		if (!vboxChooser || (vboxChooser.getSingleSelectedId() == 'host'))
    			return false;
    		
    		return vboxChooser.isSelectedInState('Editable');
    		
    	}
    },
    
    /** Discard VM State */
    discard: {
		label:trans('Discard saved state...','UIActionPool'),
		icon:'vm_discard',
		icon_16:'discard',
		click:function(){
			
			var buttons = {};
			buttons[trans('Discard','UIMessageCenter')] = function(){
				$(this).empty().remove();

				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isSaved(vms[i])) {
						vboxAjaxRequest('machineSetState',{'vm':vms[i].id,'state':'discardSavedState'});
					}
				}
			};
			var vmNames = [];
			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isSaved(vms[i])) {
					vmNames[vmNames.length] = vms[i].name;
				}
			}
			
			if(vmNames.length) {

				vmNames = '<b>'+vmNames.join('</b>, <b>')+'</b>';
				
				vboxConfirm(trans('<p>Are you sure you want to discard the saved state of the following virtual machines?</p><p><b>%1</b></p><p>This operation is equivalent to resetting or powering off the machine without doing a proper shutdown of the guest OS.</p>','UIMessageCenter').replace('%1',vmNames),buttons);
			}
		},
		enabled:function(){
			return vboxChooser.isSelectedInState('Saved');
		}
    },
    
    /** Show VM Logs */
    logs: {
		label:trans('Show Log...','UIActionPool'),
		icon:'show_logs',
		icon_disabled:'show_logs_disabled',
		click:function(){
    		vboxShowLogsDialogInit(vboxChooser.getSingleSelected());
		},
		enabled:function(){
			return (vboxChooser.getSingleSelectedId() && vboxChooser.getSingleSelectedId() != 'host');
		}
    },

    /** Save the current VM State */
	savestate: {
		label: trans('Save State', 'UIActionPool'),
		icon: 'fd',
		stop_action: true,
		enabled: function(){
			return (vboxChooser.isSelectedInState('Running') || vboxChooser.isSelectedInState('Paused'));
		},
		click: function() {

			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isRunning(vms[i]) || vboxVMStates.isPaused(vms[i]))
					vboxVMActions.powerAction('savestate','Save the machine state of the selected virtual machines', vms[i]);
			}
		}
	},

	/** Send ACPI Power Button to VM */
	powerbutton: {
		label: trans('ACPI Shutdown','UIActionPool'),
		icon: 'acpi',
		stop_action: true,
		enabled: function(){
			return vboxChooser.isSelectedInState('Running');
		},
		click: function() {
			var buttons = {};
			buttons[trans('ACPI Shutdown','UIMessageCenter')] = function() {
				$(this).empty().remove();
				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isRunning(vms[i]))
						vboxVMActions.powerAction('powerbutton','Send the ACPI Power Button press event to the virtual machine', vms[i]);		
				}
			};
			var vmNames = [];
			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isRunning(vms[i])) {
					vmNames[vmNames.length] = vms[i].name;
				}
			}
			
			if(vmNames.length) {

				vmNames = '<b>'+vmNames.join('</b>, <b>')+'</b>';

				vboxConfirm(trans("<p>Do you really want to send an ACPI shutdown signal " +
					"to the following virtual machines?</p><p><b>%1</b></p>",'UIMessageCenter').replace('%1', vmNames),buttons);
			}
		}
	},
	
	/** Pause a running VM */
	pause: {
		label: trans('Pause','UIActionPool'),
		icon: 'pause',
		icon_disabled: 'pause_disabled',
		enabled: function(){
			return vboxChooser.isSelectedInState('Running');
		},
		click: function() {
			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isRunning(vms[i]))
					vboxVMActions.powerAction('pause','Suspend the execution of the selected virtual machines', vms[i]);
			}
		}
	},
	
	/** Power off a VM */
	powerdown: {
		label: trans('Power Off','UIActionPool'),
		icon: 'poweroff',
		stop_action: true,
		enabled: function() {
			return (vboxChooser.isSelectedInState('Running') || vboxChooser.isSelectedInState('Paused'));
		},
		click: function() {
			
			var buttons = {};
			buttons[trans('Power Off','UIActionPool')] = function() {
				$(this).empty().remove();
				
				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isRunning(vms[i]) || vboxVMStates.isPaused(vms[i]))
						vboxVMActions.powerAction('powerdown','Power off the selected virtual machines', vms[i]);
				}
			};
			
			var vmNames = [];
			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isRunning(vms[i]) || vboxVMStates.isPaused(vms[i])) {
					vmNames[vmNames.length] = vms[i].name;
				}
			}
			
			if(vmNames.length) {

				vmNames = '<b>'+vmNames.join('</b>, <b>')+'</b>';
				
				vboxConfirm(trans("<p>Do you really want to power off the following virtual machines?</p>" +
						"<p><b>%1</b></p><p>This will cause any unsaved data in applications " +
						"running inside it to be lost.</p>", 'UIMessageCenter').replace('%1', vmNames), buttons);
			}

		}
	},
	
	/** Reset a VM */
	reset: {
		label: trans('Reset','UIActionPool'),
		icon: 'reset',
		icon_disabled: 'reset_disabled',
		enabled: function(){
			return vboxChooser.isSelectedInState('Running');
		},
		click: function() {
			var buttons = {};
			buttons[trans('Reset','UIActionPool')] = function() {
				$(this).remove();

				var vms = vboxChooser.getSelectedVMsData();
				for(var i = 0; i < vms.length; i++) {
					if(vboxVMStates.isRunning(vms[i]))
						vboxVMActions.powerAction('reset','Reset the selected virtual machines', vms[i]);
				}
			};
			
			var vmNames = [];
			var vms = vboxChooser.getSelectedVMsData();
			for(var i = 0; i < vms.length; i++) {
				if(vboxVMStates.isRunning(vms[i])) {
					vmNames[vmNames.length] = vms[i].name;
				}
			}
			
			if(vmNames.length) {

				vmNames = '<b>'+vmNames.join('</b>, <b>')+'</b>';

				vboxConfirm(trans("<p>Do you really want to reset the following virtual machines?</p><p><b>%1</b></p><p>This will cause any unsaved data in applications "+
						"running inside it to be lost.</p>",'UIMessageCenter').replace('%1',vmNames),buttons);
			}
		}
	},
	
	/** Stop actions list */
	stop_actions: ['savestate','powerbutton','powerdown'],

	/** Stop a VM */
	stop: {
		name: 'stop',
//		label: trans('Close','UIActionPool'),
		label: trans('Stop','VBoxSelectorWnd'),
		icon: 'acpi',
		icon_disabled:'acpi_disabled',
		menu: true,
		click: function () { return true; /* handled by stop context menu */ },
		enabled: function () {
			return (vboxChooser.isSelectedInState('Running') || vboxChooser.isSelectedInState('Paused'));
		}
	},
	
	/** Power Action Helper function */
	powerAction: function(pa,pt,vm){
		icon =null;
		switch(pa) {
			case 'powerdown': fn = 'powerDown'; icon='progress_poweroff_90px.png'; break;
			case 'powerbutton': fn = 'powerButton'; break;
			case 'savestate': fn = 'saveState'; icon='progress_state_save_90px.png'; break;
			case 'pause': fn = 'pause'; break;
			case 'reset': fn = 'reset'; break;
			default: return;
		}
		
		$.when(vboxAjaxRequest('machineSetState',{'vm':vm.id,'state':fn})).then(function(d){
			// check for progress operation
			if(d && d.responseData && d.responseData.progress) {
				vboxProgress({'progress':d.responseData.progress,'persist':d.persist},function(){
					return;
				},icon,trans(pt,'UIActionPool'), vm.name);
				return;
			}
		});		
		
	}
};


/**
 * Common Media functions object
 * 
 * @namespace vboxMedia
 */
var vboxMedia = {

	/**
	 * Return a printable string for medium m
	 * 
	 * @static
	 */
	mediumPrint : function(m,nosize,usehtml) {
		var name = vboxMedia.getName(m);
		if(nosize || !m || m.hostDrive) return name;
		return name + ' (' + (m.deviceType == 'HardDisk' ? (usehtml ? '<i>' : '') + trans(m.type,'VBoxGlobal') + (usehtml ? '</i>' : '') + ', ' : '') + vboxMbytesConvert(m.logicalSize) + ')';
	},

	/**
	 * Return printable medium name
	 * 
	 * @static
	 */
	getName : function(m) {
		if(!m) return trans('Empty','VBoxGlobal');
		if(m.hostDrive) {
			if (m.description && m.name) {
				return trans('Host Drive %1 (%2)','VBoxGlobal').replace('%1',m.description).replace('%2',m.name);
			} else if (m.location) {
				return trans('Host Drive \'%1\'','VBoxGlobal').replace('%1',m.location);
			} else {
				return trans('Host Drive','VBoxGlobal');
			}
		}
		return m.name;
	},

	/**
	 * Return printable medium type
	 * 
	 * @static
	 */
	getType : function(m) {
		if(!m || !m.type) return trans('Normal','VBoxGlobal');
		if(m.type == 'Normal' && m.base && m.base != m.id) return trans('Differencing','VBoxGlobal');
		return trans(m.type,'VBoxGlobal');
	},
	
	/**
	 * Return printable medium format
	 * 
	 * @static
	 */
	getFormat : function (m) {
		if(!m) return '';
		switch(m.format.toLowerCase()) {
			case 'vdi':
				return trans('VDI (VirtualBox Disk Image)','UIWizardNewVD');
			case 'vmdk':
				return trans('VMDK (Virtual Machine Disk)','UIWizardNewVD');
			case 'vhd':
				return trans('VHD (Virtual Hard Disk)','UIWizardNewVD');
			case 'parallels':
			case 'hdd':
				return trans('HDD (Parallels Hard Disk)','UIWizardNewVD');
			case 'qed':
				return trans('QED (QEMU enhanced disk)','UIWizardNewVD');
			case 'qcow':
				return trans('QCOW (QEMU Copy-On-Write)','UIWizardNewVD');
		}	
		return m.format;
	},
	
	/**
	 * Return printable virtual hard disk variant
	 * 
	 * @static
	 */
	getHardDiskVariant : function(m) {
		
		var variants = $('#vboxPane').data('vboxMediumVariants');
		
		
/*
 * [Standard] => 0 [VmdkSplit2G] => 1 [VmdkRawDisk] => 2 [VmdkStreamOptimized] =>
 * 4 [VmdkESX] => 8 [Fixed] => 65536 [Diff] => 131072 [NoCreateDir] =>
 * 1073741824
 */
		
		switch(m.variant) {

			case variants.Standard:
	            return trans("Dynamically allocated storage", "VBoxGlobal");
	        case (variants.Standard | variants.Diff):
	            return trans("Dynamically allocated differencing storage", "VBoxGlobal");
	        case (variants.Standard | variants.Fixed):
	            return trans("Fixed size storage", "VBoxGlobal");
	        case (variants.Standard | variants.VmdkSplit2G):
	            return trans("Dynamically allocated storage split into files of less than 2GB", "VBoxGlobal");
	        case (variants.Standard | variants.VmdkSplit2G | variants.Diff):
	            return trans("Dynamically allocated differencing storage split into files of less than 2GB", "VBoxGlobal");
	        case (variants.Standard | variants.Fixed | variants.VmdkSplit2G):
	            return trans("Fixed size storage split into files of less than 2GB", "VBoxGlobal");
	        case (variants.Standard | variants.VmdkStreamOptimized):
	            return trans("Dynamically allocated compressed storage", "VBoxGlobal");
	        case (variants.Standard | variants.VmdkStreamOptimized | variants.Diff):
	            return trans("Dynamically allocated differencing compressed storage", "VBoxGlobal");
	        case (variants.Standard | variants.Fixed | variants.VmdkESX):
	            return trans("Fixed size ESX storage", "VBoxGlobal");
	        case (variants.Standard | variants.Fixed | variants.VmdkRawDisk):
	            return trans("Fixed size storage on raw disk", "VBoxGlobal");
	        default:
	        	return trans("Dynamically allocated storage", "VBoxGlobal");
	    }

	},

	/**
	 * Return media and drives available for attachment type
	 * 
	 * @static
	 */
	mediaForAttachmentType : function(t,children) {
	
		var media = new Array();
		
		// DVD Drives
		if(t == 'DVD') { media = media.concat($('#vboxPane').data('vboxHostDetails').DVDDrives);
		// Floppy Drives
		} else if(t == 'Floppy') { 
			media = media.concat($('#vboxPane').data('vboxHostDetails').floppyDrives);
		}
		
		// media
		return media.concat(vboxTraverse($('#vboxPane').data('vboxMedia'),'deviceType',t,true,(children ? 'children' : '')));
	},

	/**
	 * Return a medium by its location
	 * 
	 * @static
	 */
	getMediumByLocation : function(p) {
		// Fix this in windows version
		if($('#vboxPane').data('vboxConfig').DSEP == '\\')
			p = p.replace('\\.','/.');
		return vboxTraverse($('#vboxPane').data('vboxMedia'),'location',p,false,'children');
	},

	/**
	 * Return a medium by its ID
	 * 
	 * @static
	 */
	getMediumById : function(id) {
		return vboxTraverse($('#vboxPane').data('vboxMedia').concat($('#vboxPane').data('vboxHostDetails').DVDDrives.concat($('#vboxPane').data('vboxHostDetails').floppyDrives)),'id',id,false,'children');
	},

	/**
	 * Return a printable list of machines and snapshots this a medium is
	 * attached to
	 * 
	 * @static
	 */
	attachedTo: function(m,nullOnNone) {
		var s = new Array();
		if(!m.attachedTo || !m.attachedTo.length) return (nullOnNone ? null : '<i>'+trans('Not Attached')+'</i>');
		for(var i = 0; i < m.attachedTo.length; i++) {
			s[s.length] = m.attachedTo[i].machine + (m.attachedTo[i].snapshots.length ? ' (' + m.attachedTo[i].snapshots.join(', ') + ')' : '');
		}
		return s.join(', ');
	},

	/**
	 * Update recent media menu and global recent media list
	 * 
	 * @static
	 */
	updateRecent : function(m, skipPathAdd) {
		
		// Only valid media that is not a host drive or iSCSI
		if(!m || !m.location || m.hostDrive || m.format == 'iSCSI') return false;
		
	    // Update recent path
		if(!skipPathAdd) {
			vboxAjaxRequest('vboxRecentMediaPathSave',{'type':m.deviceType,'folder':vboxDirname(m.location)});
			$('#vboxPane').data('vboxRecentMediaPaths')[m.deviceType] = vboxDirname(m.location);
		}
		
		// Update recent media
		// ///////////////////////
		
		// find position (if any) in current list
		var pos = jQuery.inArray(m.location,$('#vboxPane').data('vboxRecentMedia')[m.deviceType]);		
		
		// Medium is already at first position, return
		if(pos == 0) return false;
		
		// Exists and not in position 0, remove from list
		if(pos > 0) {
			$('#vboxPane').data('vboxRecentMedia')[m.deviceType].splice(pos,1);
		}
		
		// Add to list
		$('#vboxPane').data('vboxRecentMedia')[m.deviceType].splice(0,0,m.location);
		
		// Pop() until list only contains 5 items
		while($('#vboxPane').data('vboxRecentMedia')[m.deviceType].length > 5) {
			$('#vboxPane').data('vboxRecentMedia')[m.deviceType].pop();
		}

		// Update Recent Media in background
		vboxAjaxRequest('vboxRecentMediaSave',{'type':m.deviceType,'list':$('#vboxPane').data('vboxRecentMedia')[m.deviceType]});
		
		return true;

	},
	
	/**
	 * List of actions performed on Media in phpVirtualBox
	 * 
	 * @static
	 * @namespace
	 */
	actions : {
		
		/**
		 * Choose existing medium file
		 * 
		 * @static
		 */
		choose : function(path,type,callback) {
		
			if(!path) path = $('#vboxPane').data('vboxRecentMediaPaths')[type];

			title = null;
			icon = null;
			switch(type) {
				case 'HardDisk':
					title = trans('Choose a virtual hard disk file...','UIMachineSettingsStorage');
					icon = 'images/vbox/hd_16px.png';
					break;
				case 'Floppy':
					title = trans('Choose a virtual floppy disk file...','UIMachineSettingsStorage');
					icon = 'images/vbox/fd_16px.png';
					break;
				case 'DVD':
					title = trans('Choose a virtual CD/DVD disk file...','UIMachineSettingsStorage');
					icon = 'images/vbox/cd_16px.png';
					break;					
			}
			vboxFileBrowser(path,function(f){
				if(!f) return;
				var med = vboxMedia.getMediumByLocation(f);
				if(med && med.deviceType == type) {
					vboxMedia.updateRecent(med);
					callback(med);
					return;
				} else if(med) {
					return;
				}
				var ml = new vboxLoader();
				ml.add('mediumAdd',function(ret){
					var l = new vboxLoader();
					if(ret && ret.responseData.id) {
						var med = vboxMedia.getMediumById(ret.responseData.id);
						// Not registered yet. Refresh media.
						if(!med)
							l.add('vboxGetMedia',function(dret){$('#vboxPane').data('vboxMedia',dret.responseData);});
					}
					l.onLoad = function() {
						if(ret && ret.id) {
							var med = vboxMedia.getMediumById(ret.responseData.id);
							if(med && med.deviceType == type) {
								vboxMedia.updateRecent(med);
								callback(med);
								return;
							}
						}
					};
					l.run();
				},{'path':f,'type':type});
				ml.run();
			},false,title,icon);
		} // </ choose >
	
	} // </ actions >
};



/**
 * Base Wizard class (new HardDisk, VM, etc..)
 * 
 * @class vboxWizard
 * @constructor
 */
function vboxWizard() {
	
	var self = this;

	/* Number of wizard steps */
	this.steps = 0;
	
	/* Wizard name - used to determine form name and HTML pane to load */
	this.name = '';
	
	/* Title of wizard */
	this.title = '';
	
	/* Wizard dialog icon image */
	this.icon = null;
	
	/* Width and height for Simple mode */
	this.width = 700;
	this.height = 400;
	
	/* Width and height for expert mode */
	this.widthAdvanced = 600;
	this.heightAdvanced = 450;
	
	/* Background image */
	this.bg = null;
	
	/* Text on Back button */
	this.backText = trans('Back','QIArrowSplitter');
	
	/* Text on Next button */
	this.nextText = trans('Next','QIArrowSplitter');

	/* Text on cancel button */
	this.cancelText = trans('Cancel','QIMessageBox');

	/* Text on finish button */
	this.finishText = 'Finish';
	
	/* Translation context */
	this.context = '';

	/* Arrow on back button */
	this.backArrow = $('<div />').html('&laquo;').text();

	/* Arrow on Next button */
	this.nextArrow = $('<div />').html('&raquo;').text();
	
	/* Mode of wizard */
	this.mode = 'simple';
	
	/* Data to load */
	this.data = [];
	
	/* Form object held to get values */
	this.form = null;
	
	/* Reference to dialog object created */
	this.dialog = null;
	
	/* Deferred object resolved when complete */
	this.completed = $.Deferred();
	
	/* Function to run on finish */
	this.onFinish = function() {
		
		if(self.completed.state() == 'pending')
			self.completed.resolve();
		
		$(self.dialog).empty().remove();
	};
	
	/**
	 * Initialize / display wizard
	 * 
	 * @memberOf vboxWizard
	 * @name vboxWizard.run
	 * @returns {Object} deferred promise
	 */
	this.run = function() {

		// Set mode
		this.mode = (vboxGetLocalDataItem('vboxWizardMode'+this.name) == 'a' ? 'advanced' : '');
		
		this.dialog = $('<div />').attr({'id':this.name+'Dialog','style':'display: none','class':'vboxWizard'});
		
		this.form = $('<form />').attr({'name':('frm'+this.name),'style':'height:100%;margin:0px;padding:0px;border:0px;'})
			.on('submit',function(e){
				self.displayNext();
				e.stopPropagation();
				e.preventDefault();
				return false;
			});

		// main table
		var tbl = $('<table />').attr({'class':'vboxWizard','style':'height: 100%; margin:0px; padding:0px;border:0px;'});
		var tr = $('<tr />');

		
		var td = $('<td />').attr({'id':this.name+'Content','class':'vboxWizardContent'});
		
		if(this.bg) {
			$(this.dialog).css({'background':'url('+this.bg+') ' + ((this.mode == 'advanced' ? this.widthAdvanced : this.width) - 360) +'px -60px no-repeat','background-color':'#fff'});				
		}
		
		// Title and content table
		$('<h3 />').attr('id',this.name+'Title').html(this.title).appendTo(td);

		$(tr).append(td).appendTo(tbl);		
		
		this.form.append(tbl);
		this.dialog.append(this.form).appendTo($('#vboxPane'));
		
		// load data and panes
		var l = new vboxLoader(this.name+'Loader');
		for(var i = 0; i < this.data.length; i++) {
			l.add(this.data[i].fn,this.data[i].callback,(this.data[i].args ? this.data[i].args : undefined));
		}
		l.addFileToDOM('panes/'+this.name+(this.mode == 'advanced' ? 'Advanced' : '')+'.html',$('#'+this.name+'Content'));
		
		l.onLoad = function(){
		
			// Opera hidden select box bug
			// //////////////////////////////
			if($.browser.opera) {
				$('#'+self.name+'Content').find('select').bind('change',function(){
					$(this).data('vboxSelected',$(this).val());
				}).bind('show',function(){
					$(this).val($(this).data('vboxSelected'));
				}).each(function(){
					$(this).data('vboxSelected',$(this).val());
				});
			}

			// Show / Hide description button
			if(!self.stepButtons) self.stepButtons = [];
			if(!self.noAdvanced) {
				
				self.stepButtons = jQuery.merge([{
					
					name: trans((self.mode == 'advanced' ? 'Show Description' : 'Hide Description'), 'UIWizard'),
					click: function() {
						
						// Unbind any old resize handlers
						$('#'+self.name+'Dialog').unbind('dialogresizestop');
						
						// Check mode
						if(self.mode != 'advanced') {
							
							// Now in advanced mode
							self.mode = 'advanced';
							
							// Hide title, remove current content and add
							// advanced content
							$('#'+self.name+'Title').hide().siblings().empty().remove();
							
							// Hold old number of steps
							self.simpleSteps = self.steps;
							
							// resize dialog
							$('#'+self.name+'Dialog').dialog('option', 'width', self.widthAdvanced)
							.dialog('option', 'height', self.heightAdvanced)
							.css({'background':'url('+self.bg+') ' + ((self.mode == 'advanced' ? self.widthAdvanced : self.width) - 360) +'px -60px no-repeat','background-color':'#fff'});
							
							
							
							var vl = new vboxLoader();
							vl.addFileToDOM('panes/'+self.name+'Advanced.html',$('#'+self.name+'Content'));
							vl.onLoad = function() {
								
								// Change this button text
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+trans('Hide Description', 'UIWizard')+'")')
								.html(trans('Show Description', 'UIWizard'));
								
								for(var i = 0; i < self.stepButtons.length; i++) {
									if(self.stepButtons[i].name == trans('Hide Description', 'UIWizard')) {
										self.stepButtons[i].name = trans('Show Description', 'UIWizard');
									}
									
								}
								
								// Hide back button
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.backArrow + ' '+self.backText+'")').parent().hide();
								
								// Translations and setup
								vboxInitDisplay(self.name+'Content',self.context);
								
								self.steps = 1;
								
								// Go to last step
								self.displayStep(1);
								
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.finishText+'")').parent().focus();
								
							};
							vl.run();
							
						} else {
							
							// Now in simple mode
							self.mode = 'simple';
							
							// Remove current content and show simple content
							$('#'+self.name+'Title').show().siblings().empty().remove();
							
							// resize dialog
							$('#'+self.name+'Dialog').dialog('option', 'width', self.width)
								.dialog('option', 'height', self.height)
								.css({'background':'url('+self.bg+') ' + ((self.mode == 'advanced' ? self.widthAdvanced : self.width) - 360) +'px -60px no-repeat','background-color':'#fff'});
							
							
							// Reset old number of steps
							self.steps = self.simpleSteps;
							
							var vl = new vboxLoader();
							vl.addFileToDOM('panes/'+self.name+'.html',$('#'+self.name+'Content'));
							vl.onLoad = function() {
								
								// Change this button text
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane')
								.find('span:contains("'+trans('Show Description', 'UIWizard')+'")')
								.html(trans('Hide Description', 'UIWizard'));
								
								for(var i = 0; i < self.stepButtons.length; i++) {
									if(self.stepButtons[i].name == trans('Show Description', 'UIWizard')) {
										self.stepButtons[i].name = trans('Hide Description', 'UIWizard');
									}
									
								}
								
								// Translations
								vboxInitDisplay(self.name+'Content',self.context);
								
								// Show back button
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.backArrow + ' '+self.backText+'")').parent().show();
								
								self.steps = self.simpleSteps;
								
								self.displayStep(1);
								
								$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.nextArrow+'")').parent().focus();

								
							};
							vl.run();
						}
						
						vboxSetLocalDataItem('vboxWizardMode'+self.name, (self.mode == 'advanced' ? 'a' : ''));
						
						
					},
					steps: [1]
				}], self.stepButtons);
				
			}
			
			
			// buttons
			var buttons = { };
			
			if(self.stepButtons) {
				for(var i = 0; i < self.stepButtons.length; i++) {
					buttons[self.stepButtons[i].name] = self.stepButtons[i].click;
				}
			}
			
			if(!self.noAdvanced || self.steps > 1)
				buttons[self.backArrow + ' '+self.backText] = self.displayPrev;
			
			buttons[(self.steps > 1 ? self.nextText +' '+self.nextArrow : self.finishText)] = self.displayNext;
			buttons[self.cancelText] = self.close;
			
			// Translations
			vboxInitDisplay(self.name+'Content',self.context);
			
			$(self.dialog).dialog({
				'closeOnEscape':true,
				'width':(self.mode == 'advanced' ? self.widthAdvanced : self.width),
				'height':(self.mode == 'advanced' ? self.heightAdvanced : self.height),
				'buttons':buttons,
				'modal':true,
				'autoOpen':true,
				'stack':true,
				'dialogClass':'vboxDialogContent vboxWizard',
				'open' : function() {
					$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.nextArrow+'")').parent().focus();
				},
				'title':(self.icon ? '<img src="images/vbox/'+self.icon+ ( (self.icon.indexOf('.png') == -1) ? '_16px.png' : '') +'" class="vboxDialogTitleIcon" /> ' : '') + self.title
			
			}).bind('dialogclose', function(){

				// Reject if still pending
				if(self.completed.state() == 'pending')
					self.completed.reject();

				$(this).empty().remove();
				
			}).bind('keyup',function(e) {
			    
				if (e.keyCode == 13) {
			    	
					self.displayNext();
					e.stopPropagation();
					e.preventDefault();
					return false;
			    }
			});

			// Setup if in advanced mode
			if(self.mode == 'advanced') {
			
				// Hold old number of steps
				self.simpleSteps = self.steps;
				self.steps = 1;
				
				// Hide title
				$('#'+self.name+'Title').hide();
				
				// Hide back button
				$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.backArrow + ' '+self.backText+'")').parent().hide();
			}
			
			self.displayStep(1);
		};
		l.run();
		
		return self.completed.promise();
	};
	
	/**
	 * Close wizard
	 * 
	 * @memberOf vboxWizard
	 */
	this.close = function() {

		// Reject if still pending
		if(self.completed.state() == 'pending')
			self.completed.reject();

		$(self.dialog).empty().remove();
	};
	
	/**
	 * Display a step
	 * 
	 * @memberOf vboxWizard
	 * @param {Integer}
	 *            step - step to display
	 */
	this.displayStep = function(step) {
		self._curStep = step;
		for(var i = 0; i < self.steps; i++) {
			$('#'+self.name+'Step'+(i+1)).css({'display':'none'});
		}
		/* update buttons */
		if(self.stepButtons) {
			for(var i = 0; i < self.stepButtons.length; i++) {
				$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.stepButtons[i].name+'")').parent().css({'display':((step == self.steps && self.stepButtons[i].steps[0]==-1) || jQuery.inArray(step,self.stepButtons[i].steps) > -1 ? '' : 'none')});
			}
		}
		if(step == 1 && step != self.steps) {
			$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.backText+'")').parent().addClass('disabled').blur();
			$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.finishText+'")').html($('<div />').text((self.steps > 1 ? self.nextText+' '+self.nextArrow : self.finishText)).html());
		} else {
			
			$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.backText+'")').parent().removeClass('disabled');
			
			if(step == self.steps) {
				$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.nextArrow+'")').html($('<div />').text(self.finishText).html());
			} else {
				$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.finishText+'")').html($('<div />').text(self.nextText+' '+self.nextArrow).html());
			}
		}
		$('#'+self.name+'Title').html(trans($('#'+self.name+'Step'+step).attr('title'),self.context));
		$('#'+self.name+'Step'+step).css({'display':''});

		// Opera hidden select box bug
		// //////////////////////////////
		if($.browser.opera) {
			$('#'+self.name+'Step'+step).find('select').trigger('show');
		}

		$('#'+self.name+'Step'+step).trigger('show',self);

	};
	
	/**
	 * Set current wizard step to be the last step in list
	 * 
	 * @memberOf vboxWizard
	 */
	this.setLast = function() {
		$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.nextText+'")').html($('<div />').text(self.finishText).html());
		self._origSteps = self.steps;
		self.steps = self._curStep;
	};

	/**
	 * Unset the current wizard step so that it is not forced to be the last one
	 * in the list
	 * 
	 * @memberOf vboxWizard
	 */
	this.unsetLast = function() {
		$('#'+self.name+'Dialog').parent().find('.ui-dialog-buttonpane').find('span:contains("'+self.finishText+'")').html($('<div />').text(self.nextText+' '+self.nextArrow).html());
		if(self._origSteps) self.steps = self._origSteps;
	};
	
	/**
	 * Display previous step
	 * 
	 * @memberOf vboxWizard
	 */
	this.displayPrev = function() {
		if(self._curStep <= 1) return;
		self.displayStep(self._curStep - 1);
	};
	
	/**
	 * Display next step
	 * 
	 * @memberOf vboxWizard
	 */
	this.displayNext = function() {
		if(self._curStep >= self.steps) {
			self.onFinish();
			return;
		}
		self.displayStep(self._curStep + 1);
	};
	
}

/**
 * Common toolbar class
 * 
 * @constructor
 * @class vboxToolbar
 * @param {Array} buttons - buttons to add to toolbar
 */
function vboxToolbar(buttons) {

	var self = this;
	this.buttons = buttons;
	this.size = 22;
	this.addHeight = 24;
	this.lastItem = null;
	this.id = null;
	this.buttonStyle = '';
	this.enabled = true;
	this.mutliSelect = false; // true if multiple items are selected

	/**
	 * Update buttons to be enabled / disabled
	 * 
	 * @memberOf vboxToolbar
	 * @param {Object|Null}
	 *            item - item to check
	 */
	this.update = function(item) {
		
		// Event target or manually passed item
		self.lastItem = item;
		
		if(!self.enabled) return;
		
		for(var i = 0; i < self.buttons.length; i++) {
			if(self.buttons[i].enabled && !self.buttons[i].enabled(self.lastItem)) {
				self.disableButton(self.buttons[i]);
			} else {
				self.enableButton(self.buttons[i]);
			}
		}		
	};

	/**
	 * Enable entire toolbar. Calls self.update()
	 * 
	 * @memberOf vboxToolbar
	 * @param {Object}
	 *            e - event
	 * @param {Object}
	 *            item - item to pass to update
	 */ 
	this.enable = function(e, item) {
		self.enabled = true;
		self.update((item||self.lastItem));
	};

	/**
	 * Disable entire toolbar
	 * 
	 * @memberOf vboxToolbar
	 */
	this.disable = function() {
		self.enabled = false;
		for(var i = 0; i < self.buttons.length; i++) {
			self.disableButton(self.buttons[i]);
		}		
	};
	
	/**
	 * Enable a single button
	 * 
	 * @memberOf vboxToolbar
	 * @param {Object}
	 *            b - button to enable
	 */
	this.enableButton = function(b) {
		$('#vboxToolbarButton-'+self.id+'-'+b.name).addClass('vboxEnabled').removeClass('vboxDisabled').children('img.vboxToolbarImg').attr('src','images/vbox/'+b.icon+'_'+self.size+'px.png');
	};

	/**
	 * Disable a single button
	 * 
	 * @memberOf vboxToolbar
	 * @param {Object}
	 *            b - button to disable
	 */
	this.disableButton = function(b) {
		$('#vboxToolbarButton-'+self.id+'-'+b.name).addClass('vboxDisabled').removeClass('vboxEnabled').children('img.vboxToolbarImg').attr('src','images/vbox/'+b.icon+'_disabled_'+self.size+'px.png');
	};

	/**
	 * Set button label
	 * 
	 * @memberOf vboxToolbar
	 * @param {String}
	 *            bname - name of button to set label for
	 * @param {String}
	 *            l - new label for button
	 */
	this.setButtonLabel = function(bname,l) {
		$('#vboxToolbarButton-'+self.id+'-'+bname).find('span.vboxToolbarButtonLabel').html(l);
	};
	
	/**
	 * Return the button element by name
	 * 
	 * @param {String}
	 *            bname - button name
	 * @returns {HTMLNode}
	 */
	this.getButtonElement = function(bname) {
		return $('#vboxToolbarButton-'+self.id+'-'+bname);
	};
	
	/**
	 * Generate HTML element for button
	 * 
	 * @memberOf vboxToolbar
	 * @param {Object}
	 *            b - button object containing various button parameters
	 * @return {HTMLNode} button element
	 */
	this.buttonElement = function(b) {

		// Pre-load disabled version of icon if enabled function exists
		if(b.enabled) {
			var a = new Image();
			a.src = "images/vbox/"+b.icon+"_disabled_"+self.size+"px.png";
		}
		
		// TD
		var td = $('<td />').attr({'id':'vboxToolbarButton-' + self.id + '-' + b.name,
			'class':'vboxToolbarButton ui-corner-all vboxEnabled vboxToolbarButton'+self.size,
			'style':self.buttonStyle+'; min-width: '+(self.size+12)+'px;'
		}).html('<img src="images/vbox/'+b.icon+'_'+self.size+'px.png" class="vboxToolbarImg" style="height:'+self.size+'px;width:'+self.size+'px;"/><br /><span class="vboxToolbarButtonLabel">' + String(b.toolbar_label ? b.toolbar_label : b.label).replace(/\.+$/g,'')+'</span>').bind('click',function(){
			if($(this).hasClass('vboxDisabled')) return;
			$(this).data('toolbar').click($(this).data('name'));
		// store data
		}).data(b);
		
		if(!self.noHover) {
			$(td).hover(
					function(){if($(this).hasClass('vboxEnabled')){$(this).addClass('vboxToolbarButtonHover');}},
					function(){$(this).removeClass('vboxToolbarButtonHover');}		
			).mousedown(function(e){
				if($.browser.msie && e.button == 1) e.button = 0;
				if(e.button != 0 || $(this).hasClass('vboxDisabled')) return true;
				$(this).addClass('vboxToolbarButtonDown');

				var e = jQuery.Event("mouseup", {button:0});
				$(this).siblings().trigger(e);
				
				var btn = $(this);
				$(document).one('mouseup',function(){
					$(btn).removeClass('vboxToolbarButtonDown');
				});
			});
		}
		
		return td;
		
	};

	/**
	 * Add buttons to HTML node where id = id param
	 * 
	 * @memberOf vboxToolbar
	 * @param {String}
	 *            id - HTMLNode id to add buttons to
	 */
	this.addButtons = function(id) {
		
		self.id = id;
		self.height = self.size + self.addHeight; 
		
		// Create table
		var tbl = $('<table />').attr({'class':'vboxToolbar vboxToolbar'+this.size});
		var tr = $('<tr />');
		
		for(var i = 0; i < self.buttons.length; i++) {
			
			if(self.buttons[i].separator) {
				$('<td />').attr({'class':'vboxToolbarSeparator'}).html('<br />').appendTo(tr);
			}

			self.buttons[i].toolbar = self;
			$(tr).append(self.buttonElement(self.buttons[i]));
			

		}

		$(tbl).append(tr);
		$('#'+id).append(tbl).addClass('vboxToolbar vboxToolbar'+this.size).bind('disable',self.disable).bind('enable',self.enable);
		
		// If button can be enabled / disabled, disable by default
		for(var i = 0; i < self.buttons.length; i++) {
			if(self.buttons[i].enabled) {
				self.disableButton(self.buttons[i]);
			}
		}
	};

	/**
	 * Return button by name
	 * 
	 * @memberOf vboxToolbar
	 * @param {String}
	 *            n - button name
	 * @return {Object} button
	 */ 
	this.getButtonByName = function(n) {
		for(var i = 0; i < self.buttons.length; i++) {
			if(self.buttons[i].name == n)
				return self.buttons[i];
		}
		return null;
	};
	
	/**
	 * Trigger click event on button who's name = btn param
	 * 
	 * @memberOf vboxToolbar
	 * @param {String}
	 *            btn - name of button
	 * @return return value of .click() function performed on button
	 */
	this.click = function(btn) {
		var b = self.getButtonByName(btn);
		return b.click(btn);
	};
		
}

/**
 * Toolbar class for a small toolbar
 * 
 * @constructor
 * @class vboxToolbarSmall
 * @super vboxToolbar
 * @param {Array}
 *            buttons - list of buttons for toolbar
 */
function vboxToolbarSmall(buttons) {

	var self = this;
	this.parentClass = vboxToolbar;
	this.parentClass();
	this.selected = null;
	this.buttons = buttons;
	this.lastItem = null;
	this.buttonStyle = '';
	this.enabled = true;
	this.size = 16;
	this.disabledString = 'disabled';
	this.buttonCSS = {};

	/**
	 * Enable a single button
	 * 
	 * @memberOf vboxToolbarSmall
	 * @param {Object}
	 *            b - button to enable
	 * @return null
	 */
	this.enableButton = function(b) {
		if(b.noDisabledIcon)
			$('#vboxToolbarButton-' + self.id + '-' + b.name).css('display','').prop('disabled',false);
		else
			$('#vboxToolbarButton-' + self.id + '-' + b.name).css('background-image','url(images/vbox/' + (b.icon_exact ? b.icon : b.icon + '_'+self.size)+'px.png)').prop('disabled',false);
	};
	/**
	 * Disable a single button
	 * 
	 * @memberOf vboxToolbarSmall
	 * @param {Object}
	 *            b - button to disable
	 * @return null
	 */
	this.disableButton = function(b) {
		if(b.noDisabledIcon)
			$('#vboxToolbarButton-' + self.id + '-' + b.name).css('display','none').prop('disabled',false).removeClass('vboxToolbarSmallButtonHover').addClass('vboxToolbarSmallButton');
		else
			$('#vboxToolbarButton-' + self.id + '-' + b.name).css('background-image','url(images/vbox/' + (b.icon_exact ? b.icon_disabled : b.icon + '_'+self.disabledString+'_'+self.size)+'px.png)').prop('disabled',true).removeClass('vboxToolbarSmallButtonHover').addClass('vboxToolbarSmallButton');
	};

	/**
	 * Add CSS to be applied to button
	 * 
	 * @param {String}
	 *            b button name
	 * @param {Object}
	 *            css css to be applied to button
	 */
	this.addButtonCSS = function(b, css) {
		self.buttonCSS[b] = css;
	};
	
	/**
	 * Generate HTML element for button
	 * 
	 * @memberOf vboxToolbarSmall
	 * @param {Object}
	 *            b - button object containing various button parameters
	 * @return {HTMLNode} button element
	 */
	this.buttonElement = function(b) {

		// Pre-load disabled version of icon if enabled function exists
		if(b.enabled && !b.noDisabledIcon) {
			var a = new Image();
			a.src = "images/vbox/" + (b.icon_exact ? b.icon_disabled : b.icon + '_'+self.disabledString+'_'+self.size)+'px.png';
		}

		var btn = $('<input />').attr({'id':'vboxToolbarButton-' + self.id + '-' + b.name,'type':'button','value':'',
			'class':'vboxImgButton vboxToolbarSmallButton ui-corner-all',
			'title':String(b.toolbar_label ? b.toolbar_label : b.label).replace(/\.+$/g,''),
			'style':self.buttonStyle+' background-image: url(images/vbox/' + b.icon + '_'+self.size+'px.png);'
		}).click(b.click);		
		
		if(!self.noHover) {
			$(btn).hover(
					function(){if(!$(this).prop('disabled')){$(this).addClass('vboxToolbarSmallButtonHover').removeClass('vboxToolbarSmallButton');}},
					function(){$(this).addClass('vboxToolbarSmallButton').removeClass('vboxToolbarSmallButtonHover');}		
			);
		
		}
		
		// Check for button specific CSS
		if(self.buttonCSS[b.name]) btn.css(self.buttonCSS[b.name]);
		
		return btn;
		
	};

	/**
	 * Add buttons to HTML node where id = id param
	 * 
	 * @memberOf vboxToolbarSmall
	 * @param {String}
	 *            id - HTMLNode id to add buttons to
	 * @return null
	 */
	this.addButtons = function(id) {
		
		self.id = id;
		
		var targetElm = $('#'+id);
		
		if(!self.buttonStyle)
			self.buttonStyle = 'height: ' + (self.size+8) + 'px; width: ' + (self.size+8) + 'px; ';
		
		for(var i = 0; i < self.buttons.length; i++) {
			
			if(self.buttons[i].separator) {
				$(targetElm).append($('<hr />').attr({'style':'display: inline','class':'vboxToolbarSmall vboxSeperatorLine'}));
			}

			$(targetElm).append(self.buttonElement(self.buttons[i])); 
				
		}

		$(targetElm).attr({'name':self.name}).addClass('vboxToolbarSmall vboxEnablerTrigger vboxToolbarSmall'+self.size).bind('disable',self.disable).bind('enable',self.enable);
		
	};
	
}

/**
 * Media menu button class
 * 
 * @constructor
 * @class vboxButtonMediaMenu
 * @param {String} type - type of media to display
 * @param {Function} callback - callback to run when media is selected
 * @param {String} mediumPath - path to use when selecting media
 */
function vboxButtonMediaMenu(type,callback,mediumPath) {
	
	var self = this;
	this.buttonStyle = '';
	this.enabled = true;
	this.size = 16;
	this.disabledString = 'disabled';
	this.type = type;
	this.lastItem = null;
	
	/** vboxMediaMenu to display when button is clicked */
	this.mediaMenu = new vboxMediaMenu(type,callback,mediumPath);
	
	/* Static button type list */
	this.buttons = {
			
		HardDisk : {
			name : 'mselecthdbtn',
			label : trans('Set up the virtual hard disk','UIMachineSettingsStorage'),
			icon : 'hd',
			click : function () {
				return;				
			}
		},
		
		DVD : {
			name : 'mselectcdbtn',
			label : trans('Set up the virtual CD/DVD drive','UIMachineSettingsStorage'),
			icon : 'cd',
			click : function () {
				return;				
			}
		},
	
		Floppy : {
			name : 'mselectfdbtn',
			label : trans('Set up the virtual floppy drive','UIMachineSettingsStorage'),
			icon : 'fd',
			click : function () {
				return;				
			}
		}
	};
	
	// Set button based on passed type
	this.button = self.buttons[self.type];

	/**
	 * Update button to be enabled / disabled
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @param {Object|Null}
	 *            target - item to test in button's enabled() fuction
	 * @param {Object|Null}
	 *            item - item to test in button's enabled() fuction
	 * @return null
	 */
	this.update = function(target,item) {
		
		if(!self.enabled) return;
		
		self.lastItem = (item||target);
		
		if(self.button.enabled && !self.button.enabled(self.lastItem)) {
			self.disableButton();
		} else {
			self.enableButton();
		}
	};
	/**
	 * Enable this button
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @return null
	 */
	this.enableButton = function() {
		var b = self.button;
		$('#vboxButtonMenuButton-' + self.id + '-' + b.name).css('background-image','url(images/vbox/' + b.icon + '_'+self.size+'px.png)').removeClass('vboxDisabled').html('<img src="images/downArrow.png" style="margin:0px;padding:0px;float:right;width:6px;height:6px;" />');
	};
	/**
	 * Disable this button
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @return null
	 */
	this.disableButton = function() {
		var b = self.button;
		$('#vboxButtonMenuButton-' + self.id + '-' + b.name).css('background-image','url(images/vbox/' + b.icon + '_'+self.disabledString+'_'+self.size+'px.png)').removeClass('vboxToolbarSmallButtonHover').addClass('vboxDisabled').html('');
	};

	/**
	 * Enable button and menu
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @param {Object} e event object
	 * @param {Mixed} item test item passed to buttons .enabled() functions
	 * @return null
	 */
	this.enable = function(e, item) {
		self.enabled = true;
		self.update((item||self.lastItem));
		self.getButtonElm().enableContextMenu();
	};

	/**
	 * Disable button and menu
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @return null
	 */
	this.disable = function() {
		self.enabled = false;
		self.disableButton();
		self.getButtonElm().disableContextMenu();
	};
	
	
	/**
	 * Generate HTML element for button
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @return {HTMLNode}
	 */
	this.buttonElement = function() {

		var b = self.button;
		
		// Pre-load disabled version of icon if enabled function exists
		if(b.enabled) {
			var a = new Image();
			a.src = "images/vbox/" + b.icon + "_" + self.disabledString + "_" + self.size + "px.png";
		}
		
		return $('<td />').attr({'id':'vboxButtonMenuButton-' + self.id + '-' + b.name,'type':'button','value':'',
			'class':'vboxImgButton vboxToolbarSmallButton vboxButtonMenuButton ui-corner-all',
			'title':b.label,
			'style':self.buttonStyle+' background-image: url(images/vbox/' + b.icon + '_'+self.size+'px.png);text-align:right;vertical-align:bottom;'
		}).click(function(e){
			if($(this).hasClass('vboxDisabled')) return;
			$(this).addClass('vboxButtonMenuButtonDown');
			var tbtn = $(this);
			e.stopPropagation();
			e.preventDefault();
			$(document).one('mouseup',function(){
				$(tbtn).removeClass('vboxButtonMenuButtonDown');
			});
		}).html('<img src="images/downArrow.png" style="margin:0px;padding:0px;float:right;width:6px;height:6px;" />').hover(
					function(){if(!$(this).hasClass('vboxDisabled')){$(this).addClass('vboxToolbarSmallButtonHover');}},
					function(){$(this).removeClass('vboxToolbarSmallButtonHover');}		
		);
		
		
	};
	
	/**
	 * Return a jquery object containing button element.
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @return {Object} jQuery object containing button element
	 */
	this.getButtonElm = function () {
		return $('#vboxButtonMenuButton-' + self.id + '-' + self.button.name);
	};

	/**
	 * Add button to element with id
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @param {String}
	 *            id - HTMLNode id to add button to
	 */
	this.addButton = function(id) {
		
		self.id = id;
		
		var targetElm = $('#'+id);
		
		if(!self.buttonStyle)
			self.buttonStyle = 'height: ' + (self.size + ($.browser.msie || $.browser.webkit ? 3 : 7)) + 'px; width: ' + (self.size+10) + 'px; ';
		
		var tbl = $('<table />').attr({'style':'border:0px;margin:0px;padding:0px;'+self.buttonStyle});
		$('<tr />').css({'vertical-align':'bottom'}).append(self.buttonElement()).appendTo(tbl);
		
		$(targetElm).attr({'name':self.name}).addClass('vboxToolbarSmall vboxButtonMenu vboxEnablerTrigger').bind('disable',self.disable).bind('enable',self.enable).append(tbl);
		
		// Generate and attach menu
		self.mediaMenu.menuElement();
		
		self.getButtonElm().contextMenu({
	 		menu: self.mediaMenu.menu_id(),
	 		mode:'menu',
	 		button: 0
	 	},self.mediaMenu.menuCallback);
		
		
	};
	
	/**
	 * Update media menu's "Remove Medium" item
	 * 
	 * @memberOf vboxButtonMediaMenu
	 * @param {Boolean}
	 *            enabled - whether the item should be enabled or not
	 */
	this.menuUpdateRemoveMedia = function(enabled) {
		self.mediaMenu.menuUpdateRemoveMedia(enabled);
	};
}

/**
 * Media menu class
 * 
 * @constructor
 * @class vboxMediaMenu
 * @param {String}
 *            type - type of media to display
 * @param {Function}
 *            callback - callback function to run when medium is selected
 * @param {String}
 *            mediumPath - path to use when selecting media
 */
function vboxMediaMenu(type,callback,mediumPath) {

	var self = this;
	this.type = type;
	this.callback = callback;
	this.mediumPath = mediumPath;
	this.removeEnabled = true;
	
	/**
	 * Generate menu element ID
	 * 
	 * @memberOf vboxMediaMenu
	 * @return {String} string to use for menu node id
	 */
	this.menu_id = function(){
		return 'vboxMediaListMenu'+self.type;
	};
		
	/**
	 * Generate menu element
	 * 
	 * @memberOf vboxMediaMenu
	 * @return {HTMLNode} menu element
	 */
	this.menuElement = function() {
		
		// Pointer already held
		if(self._menuElm) return self._menuElm;
		
		var id = self.menu_id();
		
		// Hold pointer
		self._menu = new vboxMenu(id,id);
		
		// Add menu
		self._menu.addMenu(self.menuGetDefaults());
		
		// Update recent list
		self.menuUpdateRecent();
		
		self._menu.update();
		
		self._menuElm = $('#'+self.menu_id());
		
		return self._menuElm;
	};
	
	/**
	 * Generate and return host drives
	 * 
	 * @memberOf vboxMediaMenu
	 * @return {Array} array of objects that can be added to menu
	 */
	this.menuGetDrives = function() {
		
		var menu = [];
		
		// Add host drives
		var meds = vboxMedia.mediaForAttachmentType(self.type);
		for(var i =0; i < meds.length; i++) {
			if(!meds[i].hostDrive) continue;
			menu[menu.length] = {'name':meds[i].id,'label':vboxMedia.getName(meds[i])};
		}
		
		return menu;
		
	};
	
	
	/**
	 * List of default menu items to use for media of type self.type
	 * 
	 * @memberOf vboxMediaMenu
	 * @return {Array} List of default menu items to use for media of type
	 *         self.type
	 */
	this.menuGetDefaults = function () {
		
		menus = [];
		
		switch(self.type) {
			
			// HardDisk defaults
			case 'HardDisk':
		
				// create hard disk
				menus[menus.length] = {'name':'createD','icon':'hd_new','label':trans('Create a new hard disk...','UIMachineSettingsStorage')};

				// choose hard disk
				menus[menus.length] = {'name':'chooseD','icon':'select_file','label':trans('Choose a virtual hard disk file...','UIMachineSettingsStorage')};
				
				// Add VMM?
				if($('#vboxPane').data('vboxConfig').enableAdvancedConfig) {
					menus[menus.length] = {'name':'vmm','icon':'diskimage','label':trans('Virtual Media Manager...','UIActionPool')};
				}

				// recent list place holder
				menus[menus.length] = {'name':'vboxMediumRecentBefore','cssClass':'vboxMediumRecentBefore','enabled':function(){return false;},'hide_on_disabled':true};
								
				break;
				
			// CD/DVD Defaults
			case 'DVD':
				
				// Choose disk image
				menus[menus.length] = {'name':'chooseD','icon':'select_file','label':trans('Choose a virtual CD/DVD disk file...','UIMachineSettingsStorage')};

				// Add VMM?
				if($('#vboxPane').data('vboxConfig').enableAdvancedConfig) {
					menus[menus.length] = {'name':'vmm','icon':'diskimage','label':trans('Virtual Media Manager...','UIActionPool')};
				}
				
				// Add host drives
				menus = menus.concat(self.menuGetDrives());
								
				// Add remove drive
				menus[menus.length] = {'name':'removeD','icon':'cd_unmount','cssClass':'vboxMediumRecentBefore',
						'label':trans('Remove disk from virtual drive','UIMachineSettingsStorage'),'separator':true,
						'enabled':function(){return self.removeEnabled;}};

				break;
			
			// Floppy defaults
			default:

				// Choose disk image
				menus[menus.length] = {'name':'chooseD','icon':'select_file','label':trans('Choose a virtual floppy disk file...','UIMachineSettingsStorage')};

				// Add VMM?
				if($('#vboxPane').data('vboxConfig').enableAdvancedConfig) {
					menus[menus.length] = {'name':'vmm','icon':'diskimage','label':trans('Virtual Media Manager...','UIActionPool')};
				}
				
				// Add host drives
				menus = menus.concat(self.menuGetDrives());

				// Add remove drive
				menus[menus.length] = {'name':'removeD','icon':'fd_unmount','cssClass':'vboxMediumRecentBefore',
						'label':trans('Remove disk from virtual drive','UIMachineSettingsStorage'),'separator':true,
						'enabled':function(){return self.removeEnabled;}};

				break;
								
		}
		
		return menus;
		
	};

	/**
	 * Update "recent" media list menu items
	 * 
	 * @memberOf vboxMediaMenu
	 */
	this.menuUpdateRecent = function() {
		
		var elm = $('#'+self.menu_id());
		var list = $('#vboxPane').data('vboxRecentMedia')[self.type];
		elm.children('li.vboxMediumRecent').remove();
		var ins = elm.children('li.vboxMediumRecentBefore').last();
		for(var i = 0; i < list.length; i++) {
			if(!list[i]) continue;
			if(!vboxMedia.getMediumByLocation(list[i])) continue;
			
			$('<li />').attr({'class':'vboxMediumRecent'}).append(
					$('<a />').attr({
						'href' : '#path:'+list[i],
						'title' : list[i]
					}).text(vboxBasename(list[i]))
			).insertBefore(ins);
		}
	};
		
	/**
	 * Update "remove image from disk" menu item
	 * 
	 * @memberOf vboxMediaMenu
	 * @param {Boolean}
	 *            enabled - whether the item should be enabled or not
	 * @return null
	 */
	this.menuUpdateRemoveMedia = function(enabled) {
		self.removeEnabled = (enabled ? true : false);
		if(!self._menu) self.menuElement();
		else self._menu.update();
	};
	
	/**
	 * Update recent media menu and global recent media list
	 * 
	 * @memberOf vboxMediaMenu
	 * @param {Object}
	 *            m - medium object
	 * @param {Boolean}
	 *            skipPathAdd - don't add medium's path to vbox's list of recent
	 *            media paths
	 */
	this.updateRecent = function(m, skipPathAdd) {
		
		if(vboxMedia.updateRecent(m, skipPathAdd)) { // returns true if
														// recent media list has
														// changed
			// Update menu
			self.menuUpdateRecent();
		}
	};
	
	/**
	 * Function called when menu item is selected
	 * 
	 * @memberOf vboxMediaMenu
	 * @param {String}
	 *            action - menu item's href value (text in a href="#...")
	 */
	this.menuCallback = function(action) {
		
		switch(action) {
		
			// Create hard disk
			case 'createD':
				$.when(new vboxWizardNewHDDialog({'path':(self.mediumPath ? self.mediumPath : $('#vboxPane').data('vboxRecentMediaPaths')[self.type])+$('#vboxPane').data('vboxConfig').DSEP}).run())
					.then(function(id){
						if(!id) return;
						var med = vboxMedia.getMediumById(id);
						self.callback(med);
						self.menuUpdateRecent(med);						
					});
				break;
			
			// VMM
			case 'vmm':
				// vboxVMMDialog(select,type,hideDiff,mPath)
				$.when(vboxVMMDialog(true,self.type,true,(self.mediumPath ? self.mediumPath : $('#vboxPane').data('vboxRecentMediaPaths')[self.type]))).done(function(m){
					if(m) {
						self.callback(vboxMedia.getMediumById(m));
						self.menuUpdateRecent();
					}
				});
				break;
				
			// Choose medium file
			case 'chooseD':
				
				vboxMedia.actions.choose(self.mediumPath,self.type,function(med){
					self.callback(med);
					self.menuUpdateRecent();
				});
				
				break;
				
			// Existing medium was selected
			default:
				if(action.indexOf('path:') == 0) {
					var path = action.substring(5);
					var med = vboxMedia.getMediumByLocation(path);
					if(med && med.deviceType == self.type) {
						self.callback(med);
						self.updateRecent(med,true);
					}
					return;
				}
				var med = vboxMedia.getMediumById(action);
				self.callback(med);
				self.updateRecent(med,true);
		}
	};
		
		
}




/**
 * Menu class for use with context or button menus
 * 
 * @constructor
 * @class vboxMenu
 * @param {String}
 *            name - name of menu
 * @param {String}
 *            id - optional HTMLNode id of menu to use
 * @param {Array}
 * 			  menuItems - list of menu items to add
 */
function vboxMenu(name, id, menuItems) {

	var self = this;
	
	this.name = name;
	this.menuItems = {};
	this.iconStringDisabled = '_dis';
	this.id = id;
		
	/**
	 * return menu id
	 * 
	 * @memberOf vboxMenu
	 * @return {String} the HTMLNode id of this menu
	 */
	this.menuId = function() {
		if(self.id) return self.id;
		return self.name + 'Menu';
	};
	
	/**
	 * Add menu to menu object
	 * 
	 * @memberOf vboxMenu
	 * @param {Object}
	 *            m - menu configuration object
	 */
	this.addMenu = function(m) {
		$('#vboxPane').append(self.menuElement(m,self.menuId()));
	};

	/**
	 * Traverse menu configuration object and generate a
	 * <UL>
	 * containing menu items
	 * 
	 * @memberOf vboxMenu
	 * @param {Object}
	 *            m - menu configuration object
	 * @param {String}
	 *            mid - the optional id to use for the generated HTMLNode
	 * @return {HTMLNode} menu
	 *         <UL>
	 *         node containing menu items and submenus
	 */
	this.menuElement = function(m,mid) {

		var ul = null;
		
		if(mid) {
			ul = $('#'+mid);
			if(ul && ul.length) {
				ul.empty();
			} else {
				ul = $('<ul />').attr({'id':mid,'style':'display: none;'});
			}
		} else {
			ul = $('<ul />').attr({'style':'display: none;'});
		}
		
		ul.addClass('contextMenu');
		
		for(var i in m) {
			
			if(typeof i == 'function') continue;

			
			// get menu item
			var item = self.menuItem(m[i]);
			
			// Add to menu list
			self.menuItems[m[i].name] = m[i];

			// Children?
			if(m[i].children && m[i].children.length) {
				item.append(self.menuElement(m[i].children, self.menuId()+'-submenu-' + i));
			}
			
			ul.append(item);
			
		}
		
		return ul;
		
	};
	
	/**
	 * Menu click callback
	 * 
	 * @memberOf vboxMenu
	 * @param {Integer}
	 *            i - menu item index number
	 * @param {Object}
	 *            item - optional selected item
	 * @return return value of menu item's click() function
	 */
	this.menuClickCallback = function(i, item) {
		return self.menuItems[i].click(item);
	};
	
	/**
	 * generate menu item HTML
	 * 
	 * @memberOf vboxMenu
	 * @param {Object}
	 *            i - menu item's configuration object
	 * @return {HTMLNode}
	 *         <li> containing menu item
	 */
	this.menuItem = function(i) {

		return $('<li />').addClass((i.separator ? 'separator' : '')).addClass((i.cssClass ? i.cssClass : '')).append($('<a />')
			.html(i.label)
			.attr({
				'style' : (i.icon ? 'background-image: url('+self.menuIcon(i,false)+')' : ''),
				'id': self.name+i.name,'href':'#'+i.name
			}));		
		
	};
	
	/**
	 * Return a URL to use for menu item's icon
	 * 
	 * @memberOf vboxMenu
	 * @param {Object}
	 *            i - menu item configuration object
	 * @param {Boolean}
	 *            disabled - whether or not the icon should be disabled
	 * @return {String} url to icon to use
	 */
	this.menuIcon = function(i,disabled) {
		
		if(!i.icon) return '';
		
		// absolute url?
		if(i.icon_absolute) {
			if(disabled) return i.icon_disabled;
			return i.icon;
		}

		// exact icon?
		if(i.icon_exact) {
			if(disabled) return 'images/vbox/' + i.icon_disabled + 'px.png';
			return 'images/vbox/' + i.icon + 'px.png';
		}
		
		if(disabled) {
			return 'images/vbox/' + (i.icon_disabled ? i.icon_disabled : (i.icon_16 ? i.icon_16 : i.icon) + (i.iconStringDisabled ? i.iconStringDisabled : self.iconStringDisabled)) + '_16px.png';
		}
		
		return 'images/vbox/' + (i.icon_16 ? i.icon_16 : i.icon) + '_16px.png';
		
	};
	
	/**
	 * Update all menu items
	 * 
	 * @memberOf vboxMenu
	 * @param {Object}
	 *            testObj - object used to test for enabled()
	 * @return null
	 */
	this.update = function(testObj) {
		
		for(var i in self.menuItems) {
			
			
			if(typeof i != 'string') continue;
			
			
			// If enabled function doesn't exist, there's nothing to do
			if(!self.menuItems[i].enabled) continue;
			
			var mi = $('#'+self.name+i);
			
			// Disabled
			if(!self.menuItems[i].enabled(testObj)) {
				
				if(self.menuItems[i].hide_on_disabled) {
					mi.parent().hide();
				} else {
					self.disableItem(i,mi);
				}
			
			// Enabled
			} else {
				if(self.menuItems[i].hide_on_disabled) { 
					mi.parent().show();
				} else {
					self.enableItem(i,mi);
				}
			}
			
		}
	};

	/**
	 * Disable a single menu item
	 * 
	 * @memberOf vboxMenu
	 * @param {String}
	 *            i - menu item's name
	 * @param {Object}
	 *            mi - optional menu item HTMLNode or jQuery object
	 */
	this.disableItem = function(i, mi) {
		if(!mi) mi = $('#'+self.name+i);
		if(self.menuItems[i].icon)
			mi.css({'background-image':'url('+self.menuIcon(self.menuItems[i],true)+')'}).parent().addClass('disabled');
		else
			mi.parent().addClass('disabled');		
		
	};
	
	/**
	 * Enable a single menu item
	 * 
	 * @memberOf vboxMenu
	 * @param {String}
	 *            i - menu item's name
	 * @param {Object}
	 *            mi - optional menu item HTMLNode or jQuery object
	 */	
	this.enableItem = function(i, mi) {
		if(!mi) mi = $('#'+self.name+i);
		if(self.menuItems[i].icon)
			mi.css({'background-image':'url('+self.menuIcon(self.menuItems[i],false)+')'}).parent().removeClass('disabled');
		else
			mi.parent().removeClass('disabled');		
	};
	
	
	// Just add menu items if there were passed
	if(menuItems) self.addMenu(menuItems);

}

/**
 * Menu bar class
 * 
 * @constructor
 * @class vboxMenuBar
 * @param {String}
 *            name - name of this menu bar
 */
function vboxMenuBar(name) {
	
	var self = this;
	this.name = name;
	this.menus = new Array();
	this.menuClick = {};
	this.iconStringDisabled = '_dis';
	
	/**
	 * Add a menu to this object
	 * 
	 * @memberOf vboxMenuBar
	 * @param {Object}
	 *            m - menu configuration object
	 * @return void
	 */
	this.addMenu = function(m) {
		
		// Create menu object
		m.menuObj = new vboxMenu(m.name);
		
		// Propagate config
		m.menuObj.iconStringDisabled = self.iconStringDisabled;
		
		// Add menu
		m.menuObj.addMenu(m.menu);
		self.menus[self.menus.length] = m;
				
	};

	/**
	 * Add menu bar to element identified by ID
	 * 
	 * @memberOf vboxMenuBar
	 * @param {String}
	 *            id - HTMLNode id of node to add menu bar to
	 */
	this.addMenuBar = function(id) {
		
		$('#'+id).prepend($('<div />').attr({'class':'vboxMenuBar','id':self.name+'MenuBar'}));
		
		for(var i = 0; i < self.menus.length; i++) {
			$('#'+self.name+'MenuBar').append(
					$('<span />').attr({'id':'vboxMenuBarMenu'+self.name+self.menus[i].name}).html(self.menus[i].label)
					.contextMenu({
					 		menu: self.menus[i].menuObj.menuId(),
					 		button: 0,
					 		mode: 'menu',
					 		menusetup : function(el) {
								$(el).parent().data('vboxMenubarActive', true);
								$(document).one('mousedown',function(){
									$(el).parent().data('vboxMenubarActive', false);
								});
							}					 		
						},
						self.menus[i].menuObj.menuClickCallback
					).hover(
						function(){
							$(this).addClass('vboxBordered');
							if($(this).parent().data('vboxMenubarActive')) {
								
								// Hide any showing menu
								var e = jQuery.Event("mouseup", {button:0});
								$(this).trigger(e);
								var e = jQuery.Event("mousedown", {button:0});
								$(this).trigger(e);
								var e = jQuery.Event("mouseup", {button:0});
								$(this).trigger(e);
							}
						},
						function(){
							$(this).removeClass('vboxBordered');
						}
					).disableSelection()
				);
		}
	};
	
	
	/**
	 * Update Menu items
	 * 
	 * @memberOf vboxMenuBar
	 * @param {Object}
	 *            item - item to use in menu configuration items' update() test
	 * @return void
	 */
	this.update = function(item) {
		
		
		for(var i = 0; i < self.menus.length; i++) {
			
			// check for enabled function on entire menu object
			if(self.menus[i].enabled) {
				if(self.menus[i].enabled(item)) {
					$('#vboxMenuBarMenu'+self.name+self.menus[i].name).show();
				} else {
					$('#vboxMenuBarMenu'+self.name+self.menus[i].name).hide();
					continue;
				}
			}
			self.menus[i].menuObj.update(item);
		}
		
	};
	
	
}

/**
 * Loads data, scripts, and HTML files and optionally displays "Loading ..."
 * screen until all items have completed loading
 * 
 * @param {String} name - unique name for this loader. used to generate id
 * 		of "Loading..." div
 * @constructor
 * @class vboxLoader
 */
function vboxLoader(name) {

	if(!name) name = '';
	var self = this;
	this._load = [];
	this.onLoad = null;
	this._loadStarted = {};
	this.hideRoot = false;
	this.noLoadingScreen = false;
	this.name = name;
	
	this._data = [];
	this._files = [];
	
	/**
	 * Add data item to list of items to load
	 * 
	 * @memberOf vboxLoader
	 * @param {String}
	 *            dataFunction - function to pass to vboxAjaxRequest()
	 * @param {Function}
	 *            callback - callback to run when data is returned
	 * @param {Object}
	 *            params - params to pass to vboxAjaxRequest()
	 * @see vboxAjaxRequest()
	 */
	this.add = function(dataFunction, callback, params) {
		if(!this.name) this.name = dataFunction + 'Loader';
		this._data[this._data.length] = vboxAjaxRequest(dataFunction,params).then(callback);
	};

	/**
	 * Add file to list of items to load
	 * 
	 * @memberOf vboxLoader
	 * @param {String}
	 *            file - URL of file to load
	 * @param {Function}
	 *            callback - callback to run when file is loaded
	 * @see vboxAjaxRequest()
	 */
	this.addFile = function(file,callback) {
		this._files[this._files.length] = {
				'callback' : callback,
				'file' : file
			};		
	};

	/**
	 * Add file to list of items to load. Append resulting file to element.
	 * 
	 * @memberOf vboxLoader
	 * @param {String}
	 *            file - URL of file to load
	 * @param {jQueryObject}
	 *            elm - element to append file to
	 */
	this.addFileToDOM = function(file,elm) {
		if(elm === undefined) elm = $('body').children('div').first();
		var callback = function(f){elm.append(f);};
		self.addFile(file,callback);
	};
	
	/**
	 * Show loading screen
	 * 
	 */
	this.showLoading = function() {
		
		var div = $('<div />').attr({'id':'vboxLoaderDialog'+self.name,'title':'','style':'display: none;','class':'vboxLoaderDialog'});
		
		var tbl = $('<table />');
		var tr = $('<tr />');

		$('<td />').attr('class', 'vboxLoaderSpinner').html('<img src="images/spinner.gif" />').appendTo(tr);
		
		$('<td />').attr('class','vboxLoaderText').html(trans('<center> DesktopVirtualiztion Web Interface </center>','UIVMDesktop')).appendTo(tr);

		$(tbl).append(tr).appendTo(div);
		
		if(self.hideRoot)
			$('#vboxPane').css('display', 'none');

		$(div).dialog({
			'dialogClass' : 'vboxLoaderDialog',
			'width' : 'auto',
			'height' : 60,
			'modal' : true,
			'resizable' : false,
			'draggable' : false,
			'closeOnEscape' : false,
			'buttons' : {}
		});

	};
	
	/**
	 * Hide loading screen
	 */
	this.removeLoading = function() {
		$('#vboxLoaderDialog'+self.name).empty().remove();
	};
	
	/**
	 * Load data and optionally present "Loading..." screen
	 * 
	 * @memberOf vboxLoader
	 * @return null
	 */
	this.run = function() {

		if(!self.noLoadingScreen) {
			self.showLoading();
		}
		
		// Data first
		$.when.apply($, self._data).then(function() {
			
			// files
			for(var i = 0; i < self._files.length; i++) {
				self._files[i] = jQuery.get(self._files[i]['file'],self._files[i]['callback']);
			}
			
			$.when.apply($, self._files).then(function() {
				self._stop();
			});
				
		});
		
	};
	
	/**
	 * Remove loading screen and show body
	 * 
	 * @memberOf vboxLoader
	 */
	this._stop = function() {

		if(self.onLoad) self.onLoad(self);

		if(!self.noLoadingScreen) self.removeLoading();
		
		if(self.hideRoot) $('#vboxPane').css('display', '');
		
		if(self.onShow) self.onShow();
	};

}

/**
 * Serial port object
 * 
 * @constructor
 * @class vboxSerialPorts
 */
var vboxSerialPorts = {
	
	ports : [
      { 'name':"COM1", 'irq':4, 'port':'0x3F8' },
      { 'name':"COM2", 'irq':3, 'port':'0x2F8' },
      { 'name':"COM3", 'irq':4, 'port':'0x3E8' },
      { 'name':"COM4", 'irq':3, 'port':'0x2E8' },
	],
	
	/**
	 * Return port name based on irq and port
	 * 
	 * @param {Integer}
	 *            irq - irq number
	 * @param {String}
	 *            port - IO port
	 * @return {String} port name
	 */
	getPortName : function(irq,port) {
		for(var i = 0; i < vboxSerialPorts.ports.length; i++) {
			if(vboxSerialPorts.ports[i].irq == irq && vboxSerialPorts.ports[i].port.toUpperCase() == port.toUpperCase())
				return vboxSerialPorts.ports[i].name;
		}
		return 'User-defined';
	}
	
};

/**
 * LPT port object
 * 
 * @constructor
 * @class vboxParallelPorts
 */
var vboxParallelPorts = {
	
	ports : [
      { 'name':"LPT1", 'irq':7, 'port':'0x3BC' },
      { 'name':"LPT2", 'irq':5, 'port':'0x378' },
      { 'name':"LPT3", 'irq':5, 'port':'0x278' }
	],

	/**
	 * Return port name based on irq and port
	 * 
	 * @param {Integer}
	 *            irq - irq number
	 * @param {String}
	 *            port - IO port
	 * @return {String} port name
	 */	
	getPortName : function(irq,port) {
		for(var i = 0; i < vboxParallelPorts.ports.length; i++) {
			if(vboxParallelPorts.ports[i].irq == irq && vboxParallelPorts.ports[i].port.toUpperCase() == port.toUpperCase())
				return vboxParallelPorts.ports[i].name;
		}
		return 'User-defined';
	}
	
};


/**
 * Common VM storage / controller object
 * 
 * @namespace vboxStorage
 */
var vboxStorage = {

	/**
	 * Return list of bus types
	 * 
	 * @memberOf vboxStorage
	 * @static
	 * @return {Array} list of all storage bus types
	 */
	getBusTypes : function() {
		var busts = [];
		for(var i in vboxStorage) {
			if(typeof i == 'function') continue;
			if(!vboxStorage[i].maxPortCount) continue;
			busts[busts.length] = i;
		}
		return busts;
	},
	
	IDE : {
		maxPortCount : 2,
		maxDevicesPerPortCount : 2,
		types :['PIIX3','PIIX4','ICH6' ],
		ignoreFlush : true,
		slotName : function(p,d) {
			switch(p+'-'+d) {
				case '0-0' : return (trans('IDE Primary Master','VBoxGlobal'));
				case '0-1' : return (trans('IDE Primary Slave','VBoxGlobal'));
				case '1-0' : return (trans('IDE Secondary Master','VBoxGlobal'));
				case '1-1' : return (trans('IDE Secondary Slave','VBoxGlobal'));
			}
		},
		driveTypes : ['dvd','disk'],
		slots : function() { return {
		          	'0-0' : (trans('IDE Primary Master','VBoxGlobal')),
		          	'0-1' : (trans('IDE Primary Slave','VBoxGlobal')),
		          	'1-0' : (trans('IDE Secondary Master','VBoxGlobal')),
		          	'1-1' : (trans('IDE Secondary Slave','VBoxGlobal'))
			};
		}
	},
		
	SATA : {
		maxPortCount : 30,
		maxDevicesPerPortCount : 1,
		ignoreFlush : true,
		types : ['IntelAhci'],
		driveTypes : ['dvd','disk'],
		slotName : function(p,d) { return trans('SATA Port %1','VBoxGlobal').replace('%1',p); },
		slots : function() {
					var s = {};
					for(var i = 0; i < 30; i++) {
						s[i+'-0'] = trans('SATA Port %1','VBoxGlobal').replace('%1',i);
					}
					return s;
				}
	},
		
	SCSI : {
		maxPortCount : 16,
		maxDevicesPerPortCount : 1,
		driveTypes : ['disk'],
		types : ['LsiLogic','BusLogic'],
		ignoreFlush : true,
		slotName : function(p,d) { return trans('SCSI Port %1','VBoxGlobal').replace('%1',p); },
		slots : function() {
						var s = {};
						for(var i = 0; i < 16; i++) {
							s[i+'-0'] = trans('SCSI Port %1','VBoxGlobal').replace('%1',i);
						}
						return s;				
					}
	},
		
	Floppy : {
		maxPortCount : 1,
		maxDevicesPerPortCount : 2,
		types : ['I82078'],
		driveTypes : ['floppy'],
		slotName : function(p,d) { return trans('Floppy Device %1','VBoxGlobal').replace('%1',d); },
		slots : function() { return { '0-0':trans('Floppy Device %1','VBoxGlobal').replace('%1','0'), '0-1' :trans('Floppy Device %1','VBoxGlobal').replace('%1','1') }; }
	},

	
	SAS : {
		maxPortCount : 8,
		maxDevicesPerPortCount : 1,
		types : ['LsiLogicSas'],
		driveTypes : ['disk'],
		slotName : function(p,d) { return trans('SAS Port %1','VBoxGlobal').replace('%1',p); },
		slots : function() {
						var s = {};
						for(var i = 0; i < 8; i++) {
							s[i+'-0'] = trans('SAS Port %1','VBoxGlobal').replace('%1',i);
						}
						return s;				
					},
		displayInherit : 'SATA'
	}

};

/**
 * Storage Controller Types conversions
 * 
 * @param {String}
 *            c - storage controller type
 * @return {String} string used for translation
 */
function vboxStorageControllerType(c) {
	switch(c) {
		case 'LsiLogic': return 'Lsilogic';
		case 'LsiLogicSas': return 'LsiLogic SAS';
		case 'IntelAhci': return 'AHCI';
	}
	return c;
}
/**
 * Serial port mode conversions
 * 
 * @param {String}
 *            m - serial port mode
 * @return {String} string used for translation
 */
function vboxSerialMode(m) {
	switch(m) {
		case 'HostPipe': return 'Host Pipe';
		case 'HostDevice': return 'Host Device';
		case 'RawFile': return 'Raw File';
	}
	return m;
}

/**
 * Network adapter type conversions
 * 
 * @param {String}
 *            t - network adapter type
 * @return {String} string used for translation
 */
function vboxNetworkAdapterType(t) {
	switch(t) {
		case 'Am79C970A': return 'PCnet-PCI II (Am79C970A)';
		case 'Am79C973': return 'PCnet-FAST III (Am79C973)';
		case 'I82540EM': return 'Intel PRO/1000 MT Desktop (82540EM)';
		case 'I82543GC': return 'Intel PRO/1000 T Server (82543GC)';
		case 'I82545EM': return 'Intel PRO/1000 MT Server (82545EM)';
		case 'Virtio': return 'Paravirtualized Network (virtio-net)';
	}
}

/**
 * Audio controller conversions
 * 
 * @param {String}
 *            c - audio controller type
 * @return {String} string used for translation
 */
function vboxAudioController(c) {
	switch(c) {
		case 'AC97': return 'ICH AC97';
		case 'SB16': return 'SoundBlaster 16';
		case 'HDA': return 'Intel HD Audio';
	}
}
/**
 * Audio driver conversions
 * 
 * @param {String}
 *            d - audio driver type
 * @return {String} string used for translation
 */
function vboxAudioDriver(d) {
	switch(d) {
		case 'OSS': return 'OSS Audio Driver';
		case 'ALSA': return 'ALSA Audio Driver';
		case 'Pulse': return 'PulseAudio';
		case 'WinMM': return 'Windows Multimedia';
		case 'DirectSound': return 'Windows DirectSound';
		case 'Null': return 'Null Audio Driver';
		case 'SolAudio': return 'Solaris Audio';
	}
	return d;
}
/**
 * VM storage device conversions
 * 
 * @param {String}
 *            d - storage device type
 * @return {String} string used for translation
 */
function vboxDevice(d) {
	switch(d) {
		case 'DVD': return 'CD/DVD-ROM';
		case 'HardDisk': return 'Hard Disk';
	}
	return d;
}

/**
 * VM State functions namespace
 */
var vboxVMStates = {
	
	/* Return whether or not vm is running */
	isRunning: function(vm) {
		return (vm && jQuery.inArray(vm.state, ['Running','LiveSnapshotting','Teleporting']) > -1);
	},
	
	/* Whether or not a vm is paused */
	isPaused: function(vm) {
		return (vm && jQuery.inArray(vm.state, ['Paused','TeleportingPausedVM']) > -1);
	},
	
	/* True if vm is powered off */
	isPoweredOff: function(vm) {
		return (vm && jQuery.inArray(vm.state, ['PoweredOff','Saved','Teleported', 'Aborted']) > -1);
	},
	
	/* True if vm is saved */
	isSaved: function(vm) {
		return (vm && vm.state == 'Saved');
	},
	
	/* True if vm is editable */
	isEditable: function(vm) {
		return (vm && vm.sessionState == 'Unlocked');
	},
	
	/* True if one VM in list matches item */
	isOne: function(test, vmlist) {
	
		for(var i = 0; i < vmlist.length; i++) {
			if(vboxVMStates['is'+test](vmlist[i]))
				return true;
		}
		return false;
	},
	
	/* Convert Machine state to translatable state */
	convert: function(state) {
		switch(state) {
			case 'PoweredOff': return 'Powered Off';
			case 'LiveSnapshotting': return 'Live Snapshotting';
			case 'TeleportingPausedVM': return 'Teleporting Paused VM';
			case 'TeleportingIn': return 'Teleporting In';
			case 'TakingLiveSnapshot': return 'Taking Live Snapshot';
			case 'RestoringSnapshot': return 'Restoring Snapshot';
			case 'DeletingSnapshot': return 'Deleting Snapshot';
			case 'SettingUp': return 'Setting Up';
			default: return state;
		}
	}
};

