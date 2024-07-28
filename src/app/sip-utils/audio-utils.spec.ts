import {checkMicrophonePermission} from "./audio-utils";

const mockPermissionQuery = (state: string) => Promise.resolve({state} as PermissionStatus);

describe('checkMicrophonePermission', () => {
  it('should be falsy', async () => {
    spyOn(navigator.permissions, 'query').and.callFake(() => mockPermissionQuery('denied'));
    expect(await checkMicrophonePermission()).toBe(false);
  });

  it('should be truthy', async () => {
    spyOn(navigator.permissions, 'query').and.callFake(() => mockPermissionQuery('granted'));
    expect(await checkMicrophonePermission()).toBe(true);
  });
});
