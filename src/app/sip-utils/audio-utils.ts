export type AudioUtil = HTMLAudioElement & { setSinkId(deviceId: string): Promise<undefined>; };

export async function checkMicrophonePermission(): Promise<boolean> {
  if (!navigator.permissions) {
    return true;
  }
  try {
    const microphonePermission = await navigator.permissions.query({name: 'microphone' as PermissionName});
    if (microphonePermission.state === 'granted') {
      return true;
    } else if (microphonePermission.state === 'prompt') {
      alert('Please grant access to the microphone permission to use this functionality.');
      const micPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      micPermission?.getTracks().forEach((track) => track.stop());
      return true;
    } else {
      alert('Microphone access denied.');
      return false;
    }
  } catch (error) {
    // Some permissions are not available for query at this time. If we get a TypeError assume Browser don't have the
    // permission and proceed.
    return error instanceof TypeError;
  }
}
