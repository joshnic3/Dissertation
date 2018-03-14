describe("similarity", function () {  
    it("should return 0 for non-similar values.", function () {
        expect(similarity(1,2)).toBe(0);
    });
  });

  describe("similarity", function () {  
    it("should return 1 for similar values.", function () {
        expect(similarity(1,1)).toBe(1);
    });
  });


  describe("findMin", function () {  
    it("should return the smallest value in the array.", function () {
        var array = [4,3,1,2]
        expect(findMin(array)).toBe(1);
    });
  });

  // Test other Branches.
  describe("getDomainFromURL", function () {  
    it("should return the domain name from a URL", function () {
        var url = "https://jobs.apple.com/us/search"
        var expectedDomain = "apple";
        expect(getDomainFromURL(url)).toBe(expectedDomain);
    });
  });

  