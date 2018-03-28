var chrome =  {
    storage: {
        sync: {
            set: function() {}
        }
    }
}; 

describe("TEST", function () {  

    beforeEach(function() {  
    });

    it("should return TEST", function () {
        
        spyOn(window, 'restoreSavedOptions')
        // spyOn(chrome.storage.sync, 'set')

        // window.onReceive

        // // This isnt calling the Spy on 'chrome.storage.sync.set'. 
        // //window.onReceive;

        // chrome.storage.sync.set();

        expect(window.restoreSavedOptions).toHaveBeenCalled();
    });
});
