import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SimpleUserDelegate, SimpleUserOptions} from "sip.js/lib/platform/web";
import {SipSimpleUser} from "../sip-utils/SipSimpleUser";
import {AudioUtil, checkMicrophonePermission} from "../sip-utils/audio-utils";

@Component({
  selector: 'app-call-demo',
  templateUrl: './call-demo.component.html',
  styleUrls: ['./call-demo.component.scss']
})
export class CallDemoComponent implements OnInit, AfterViewInit {
  microphoneDevices: MediaDeviceInfo[] = [];
  activeMicrophone: string | undefined;
  speakerDevices: MediaDeviceInfo[] = [];
  activeSpeaker: string | undefined;
  disableConnectBtn = false;
  disableCallBtn = false;
  disableHangupBtn = false;
  disableDisconnectBtn = false;
  audioElement: AudioUtil | undefined;

  @ViewChild('remoteAudio') set playerRef(ref: ElementRef<AudioUtil>) {
    this.audioElement = ref.nativeElement;
  }

  // WebSocket Server URL
  readonly webSocketServer = "wss://edge.sip.onsip.com";

// Destination URI
  readonly target = "sip:echo@sipjs.onsip.com";

// Name for demo user
  readonly displayName = "SIP.js Demo";

  // SimpleUser delegate
  readonly simpleUserDelegate: SimpleUserDelegate = {
    onCallCreated: (): void => {
      console.log(`[${this.displayName}] Call created`);
      this.disableCallBtn = true;
      this.disableHangupBtn = false;
    },
    onCallAnswered: (): void => {
      console.log(`[${this.displayName}] Call answered`);
    },
    onCallHangup: (): void => {
      console.log(`[${this.displayName}] Call hangup`);
      this.disableCallBtn = false;
      this.disableHangupBtn = true;
    },
    onCallHold: (held: boolean): void => {
      console.log(`[${this.displayName}] Call hold ${held}`);
    }
  };
  simpleUserOptions: SimpleUserOptions | undefined;
  simpleUser: SipSimpleUser | undefined;

  constructor() {
  }

  async ngOnInit() {
    if (await checkMicrophonePermission()) {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.microphoneDevices = devices.filter((device) => device.kind === 'audioinput');
      debugger;
      if (this.microphoneDevices.length > 0) {
        this.activeMicrophone = this.microphoneDevices[0].deviceId;
      }
      this.speakerDevices = devices.filter((device) => device.kind === 'audiooutput');
      debugger;
      if (this.speakerDevices.length > 0) {
        this.activeSpeaker = this.speakerDevices[0].deviceId;
      }
    }
  }

  ngAfterViewInit(): void {
// SimpleUser options
    this.simpleUserOptions = {
      delegate: this.simpleUserDelegate,
      media: {
        remote: {
          audio: this.audioElement
        }
      },
      userAgentOptions: {
        // logLevel: "debug",
        displayName: this.displayName
      }
    };

    // SimpleUser construction
    this.simpleUser = new SipSimpleUser(this.webSocketServer, this.simpleUserOptions);
  }

  connectCall() {
    this.disableConnectBtn = true;
    this.disableDisconnectBtn = true;
    this.disableCallBtn = true;
    this.disableHangupBtn = true;
    this.simpleUser
      ?.connect()
      .then(() => {
        this.disableConnectBtn = true;
        this.disableDisconnectBtn = false;
        this.disableCallBtn = false;
        this.disableHangupBtn = true;
      })
      .catch((error: Error) => {
        this.disableConnectBtn = false;
        console.error(`[${this.simpleUser?.id}] failed to connect`);
        console.error(error);
        alert("Failed to connect.\n" + error);
      });
  }

  async makeCall() {
    console.log("ACTIVE_MIC__" + this.activeMicrophone);
    this.disableCallBtn = true;
    this.disableHangupBtn = true;
    await this.simpleUser
      ?.call(this.target, {
        inviteWithoutSdp: false,
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: {
              deviceId: this.activeMicrophone
            },
            vide: false
          }
        }
      })
      .catch((error: Error) => {
        console.error(`[${this.simpleUser?.id}] failed to place call`);
        console.error(error);
        alert("Failed to place call.\n" + error);
      });
  }

  hangupCall() {
    this.disableCallBtn = true;
    this.disableHangupBtn = true;
    this.simpleUser?.hangup().catch((error: Error) => {
      console.error(`[${this.simpleUser?.id}] failed to hangup call`);
      console.error(error);
      alert("Failed to hangup call.\n" + error);
    });
  }

  disconnectCall() {
    this.disableConnectBtn = true;
    this.disableDisconnectBtn = true;
    this.disableCallBtn = true;
    this.disableHangupBtn = true;
    this.simpleUser
      ?.disconnect()
      .then(() => {
        this.disableConnectBtn = false;
        this.disableDisconnectBtn = true;
        this.disableCallBtn = true;
        this.disableHangupBtn = true;
      })
      .catch((error: Error) => {
        console.error(`[${this.simpleUser?.id}] failed to disconnect`);
        console.error(error);
        alert("Failed to disconnect.\n" + error);
      });
  }

  onSpeakerChanged() {
    if (this.activeSpeaker) {
      this.audioElement?.setSinkId(this.activeSpeaker);
    }
  }

  onMicrophoneChanged() {
    if (this.activeMicrophone && this.simpleUser?.session) {
      this.simpleUser.session.invite({
        sessionDescriptionHandlerOptions: {
          constraints: {
            audio: {
              deviceId: this.activeMicrophone
            },
            vide: false
          }
        }
      }).catch((error: Error) => {
        console.error(`[${this.simpleUser?.id}] failed to place call`);
        console.error(error);
        alert("Failed to place call.\n" + error);
      });
    }
  }
}

