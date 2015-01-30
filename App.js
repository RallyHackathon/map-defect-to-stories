Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: {
        type: 'fit'
    },

    config: {
        customDefectField: 'c_AssociatedUserStories'
    },

    launch: function() {
        var app = this;

        var vbox = this.add({
            xtype: 'container',
            layout: {
                type: 'vbox',
                align: 'stretch'
            }
        });

        var defectPanel = vbox.add({
            xtype: 'panel',
            title: '1. Click a defect'
        });

        var defectGridConfig = this._createDefectGridConfig(app);
        defectPanel.add(defectGridConfig);

        var storyPanel = vbox.add({
            xtype: 'panel',
            id: 'storypanel',
            title: '2. Check the stories to associate'
        });

        var storyGridConfig = this._createStoryGridConfig();
        storyPanel.add(storyGridConfig);

        var buttonContainer = vbox.add({
            xtype: 'panel',
            border: false,
            id: 'buttonpanel',
            title: '3. Save your choices'
        });
        var okButton = buttonContainer.add({
            xtype: 'rallybutton',
            id: 'savebutton',
            text: 'Save',
            handler: this._onOK,
            scope: app,
            width: 100
        });


    },

    _createDefectGridConfig: function(app) {
        return {
            xtype: 'rallygrid',
            itemId: 'defectgrid',
            autoLoad: true,
            columnCfgs: [
                'FormattedID',
                'Name',
                'Owner',
                'c_AssociatedUserStories'
            ],
            storeConfig: {
                model: 'defect'
            },
            viewConfig: {
                stripeRows: false
            },
            listeners: {
                beforeCellClick: function(view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    e.stopEvent();
                    this.selectedDefect = record;

                    view.select(record);
                    this.down('#defectgrid').highlightRowForRecord(record);
                    
                    return false;
                },
                scope: app
            }
        };
    },

    _createStoryGridConfig: function() {
        return {
            xtype: 'rallygrid',
            itemId: 'storygrid',
            autoLoad: true,
            selModel: {
                selType: 'checkboxmodel',
                checkOnly: true
            },
            columnCfgs: [
                'FormattedID',
                'Name',
                'Owner'
            ],
            storeConfig: {
                model: 'userstory'
            },
            viewConfig: {
                stripeRows: false
            }
        };
    },

    _onOK: function() {
        var defect = this.selectedDefect;
        if (!defect) {
            alert('Please choose a defect');
            return;
        }

        var storyGrid = this.down('#storygrid');
        var checkedStories = storyGrid.getSelectionModel().selected.getRange();

        if (!checkedStories || checkedStories.length === 0) {
            alert('Please choose at least one story to associate to ' + defect.get('FormattedID'));
            return;
        }

        var checkedStoryIds = _.invoke(checkedStories, 'get', 'FormattedID');

        defect.set(this.customDefectField, checkedStoryIds.join(';'));
        defect.save();
    }
});
