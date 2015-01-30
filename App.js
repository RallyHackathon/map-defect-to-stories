Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: {
        type: 'fit'
    },

    config: {
        customDefectField: 'c_AssociatedUserStories',
        defectFilters: [
            {
                property: 'State',
                operator: '!=',
                value: 'Closed'
            }
        ],
        defectGridHeight: 200,
        storyGridHeight: 310
    },

    launch: function() {
        var app, vbox, defectPanel, storyGridPanel, buttonContainer,
            defectGridConfig, okButton;

        app = this;

        vbox = this.add({
            xtype: 'container',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            autoScroll: true
        });

        //defect panel with grid
        defectPanel = vbox.add({
            xtype: 'panel',
            title: '1. Click a defect'
        });
        defectGridConfig = this._createDefectGridConfig(app);
        defectPanel.add(defectGridConfig);

        //story panel
        storyGridPanel = vbox.add({
            id: 'storypanel',
            title: '2. Check the stories to associate',
            height: this.storyGridHeight + 60 //hack to keep paging toolbar from getting chopped off
        });
        //story grid is a treegrid because filtering is easy.
        //But getting the grid configuration is ansynchronous, so is added slightly differently.
        this._getStoryGridConfig().then({
            success: function(storyGridConfig) {
                storyGridPanel.add(storyGridConfig);
            }
        });

        //Save button
        buttonContainer = vbox.add({
            border: false,
            id: 'buttonpanel',
            title: '3. Save your choices'
        });
        buttonContainer.add({
            xtype: 'rallybutton',
            id: 'savebutton',
            text: 'Save',
            handler: this._onOK,
            scope: app,
            width: 100
        });


    },

    _createDefectGridConfig: function() {
        return {
            xtype: 'rallygrid',
            itemId: 'defectgrid',
            autoLoad: true,
            columnCfgs: [
                'FormattedID',
                'Name',
                'Owner',
                'Iteration',
                'c_AssociatedUserStories'

            ],
            storeConfig: {
                model: 'defect',
                filters: this.defectFilters
            },
            viewConfig: {
                stripeRows: false
            },
            listeners: {
                beforeCellClick: function(view, td, cellIndex, record, tr, rowIndex, e, eOpts) {
                    e.stopEvent();
                    this.selectedDefect = record;

                    this.down('#defectgrid').highlightRowForRecord(record);
                    view.select(record);
                    //return false so which will cancel the click, so that it doesn't start editing the cell.
                    return false;
                },
                scope: this
            },
            height: this.defectGridHeight
        };
    },

    _getStoryGridConfig: function() {
        var deferred = new Deft.Deferred(),
            modelNames = ['userstory'];

        Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
            models: modelNames,
            autoLoad: true,
            enableHierarchy: false
        }).then({
            success: function (store) {
                deferred.resolve({
                    xtype: 'rallygridboard',
                    context: this.getContext(),
                    modelNames: modelNames,
                    toggleState: 'grid',
                    gridConfig: {
                        enableRanking: false,
                        store: store,
                        columnCfgs: [
                            'FormattedID',
                            'Name',
                            'Owner'
                        ],
                        selModel: {
                            selType: 'checkboxmodel',
                            checkOnly: true
                        }
                    },
                    plugins: [{
                        ptype: 'rallygridboardcustomfiltercontrol',
                        filterControlConfig: {
                            modelNames: modelNames
                        }
                    }],
                    height: this.storyGridHeight
                });
            },
            scope: this
        });

        return deferred.promise;
    },

    _createStoryGridConfig: function() {
        return {
            xtype: 'rallygrid',
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
        var defect, storyGrid, checkedStories, checkedStoryIds;

        defect = this.selectedDefect;
        if (!defect) {
            alert('Please choose a defect');
            return;
        }

        storyGrid = this.down('#storypanel rallytreegrid');
        checkedStories = storyGrid.getSelectionModel().selected.getRange();

        if (!checkedStories || checkedStories.length === 0) {
            alert('Please choose at least one story to associate to ' + defect.get('FormattedID'));
            return;
        }

        checkedStoryIds = _.invoke(checkedStories, 'get', 'FormattedID');

        defect.set(this.customDefectField, checkedStoryIds.join(';'));
        defect.save();
    }
});
