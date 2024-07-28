import {CallDemoComponent} from "./call-demo.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {SipSimpleUser} from "../sip-utils/SipSimpleUser";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";

const mockPermissionQuery = (state: string) => Promise.resolve({state} as PermissionStatus);

describe('CallDemoComponent', () => {
  let component: CallDemoComponent;
  let fixture: ComponentFixture<CallDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CallDemoComponent],
      imports: [
        BrowserModule,
        FormsModule,
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should initialize microphone and speaker devices', async () => {
    spyOn(window.navigator.mediaDevices, 'enumerateDevices').and.returnValue(Promise.resolve([
      {kind: 'audioinput', deviceId: 'mic1'},
      {kind: 'audiooutput', deviceId: 'speaker1'}
    ] as MediaDeviceInfo[]));
    spyOn(navigator.permissions, 'query').and.callFake(() => mockPermissionQuery('granted'));

    await component.ngOnInit();

    expect(component.microphoneDevices.length).toBe(1);
    expect(component.speakerDevices.length).toBe(1);
  });

  it('should connect call', () => {
    const mockSimpleUser = jasmine.createSpyObj('SipSimpleUser', ['connect']);
    mockSimpleUser.connect.and.returnValue(Promise.resolve());
    component.simpleUser = mockSimpleUser as unknown as SipSimpleUser;

    component.connectCall();

    expect(mockSimpleUser.connect).toHaveBeenCalled();
  });
});
