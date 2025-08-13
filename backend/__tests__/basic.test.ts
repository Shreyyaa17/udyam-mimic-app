describe("Basic Test Setup", () => {
  test("should run tests successfully", () => {
    expect(1 + 1).toBe(2);
  });

  test("should have access to test environment", () => {
    expect(process.env.NODE_ENV).toBe("test");
  });
});
