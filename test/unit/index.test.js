jest.mock("../../app/messaging");
const { start: mockStartMessaging } = require("../../app/messaging");

jest.mock("../../app/storage");
const { initialiseContainers: mockInitialise } = require("../../app/storage");

jest.mock("../../app/cache");
const { start: mockStartCache } = require("../../app/cache");

describe("app", () => {
  beforeEach(() => {
    require("../../app");
  });

  test("starts messaging once", async () => {
    expect(mockStartMessaging).toHaveBeenCalledTimes(1);
  });

  test("initialises storage once", async () => {
    expect(mockInitialise).toHaveBeenCalledTimes(1);
  });

  test("starts cache once", async () => {
    expect(mockStartCache).toHaveBeenCalledTimes(1);
  });
});
