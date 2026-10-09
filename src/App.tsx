import { useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import GuidedFlow, { type GuidedFlowHandle, type GuideStepState } from "./guided-flow/GuidedFlow";
import { spirometryFlow, type SpirometryContext } from "./guided-flow/flows/spirometry";
import { resolveReply, scriptedTranscript, type AssistantReply, type ReplyChip } from "./guided-flow/voiceScripts";

// Follows Vite's base URL so assets resolve when hosted under a sub-path (e.g. GitHub Pages).
const assetPathPrefix = `${import.meta.env.BASE_URL}assets`;

const imgGroup = `${assetPathPrefix}/09250.svg`;
const imgGroup1 = `${assetPathPrefix}/a811c.svg`;
const imgGroup2 = `${assetPathPrefix}/a0511.svg`;
const imgEllipse41 = `${assetPathPrefix}/1c53f.svg`;
const imgEllipse42 = `${assetPathPrefix}/e6aca.svg`;
const imgEllipse43 = `${assetPathPrefix}/a9681.svg`;
const imgFrame4771 = `${assetPathPrefix}/b8bca.png`;
const imgFrame4772 = `${assetPathPrefix}/46f5a.png`;
const imgFrame4773 = `${assetPathPrefix}/75ffc.png`;
const imgFrame4774 = `${assetPathPrefix}/52346.png`;
const imgAvatar = `${assetPathPrefix}/e47b7.png`;
const imgAvatar1 = `${assetPathPrefix}/34364.png`;
const imgAvatar2 = `${assetPathPrefix}/ef7e3.png`;
const imgAvatar3 = `${assetPathPrefix}/f06a4.png`;
const imgGroup6 = `${assetPathPrefix}/9766f.svg`;
const imgGroup7 = `${assetPathPrefix}/32d4a.svg`;
const imgGroup8 = `${assetPathPrefix}/19638.svg`;
const imgGroup9 = `${assetPathPrefix}/12f9c.svg`;
const imgGroup10 = `${assetPathPrefix}/89721.svg`;
const imgGroup11 = `${assetPathPrefix}/c185c.svg`;
const imgGroup12 = `${assetPathPrefix}/12c42.svg`;
const imgGroup13 = `${assetPathPrefix}/e041f.svg`;
const imgGroup14 = `${assetPathPrefix}/ec649.svg`;
const imgMenu = `${assetPathPrefix}/c0ae0.svg`;
const imgEllipse7 = `${assetPathPrefix}/da13e.svg`;
const imgGroup1948 = `${assetPathPrefix}/761b9.svg`;
const imgGroup1949 = `${assetPathPrefix}/eb0dd.svg`;
const imgGroup1950 = `${assetPathPrefix}/89a5b.svg`;
const imgGroup1951 = `${assetPathPrefix}/ee2d0.svg`;
const imgGroup1952 = `${assetPathPrefix}/af3cd.svg`;
const imgGroup1953 = `${assetPathPrefix}/24d34.svg`;
const imgGroup1954 = `${assetPathPrefix}/a0c17.svg`;
const imgGroup1955 = `${assetPathPrefix}/4ca14.svg`;
const imgLinkPatient2 = `${assetPathPrefix}/16f3d.svg`;
const imgChat = `${assetPathPrefix}/c22f7.svg`;
const imgSearch = `${assetPathPrefix}/dadab.svg`;
const imgRectangle5 = `${assetPathPrefix}/63419.svg`;
const imgStar = `${assetPathPrefix}/d4cad.svg`;
const imgArrowCarrot = `${assetPathPrefix}/1626b.svg`;
const imgIcon = `${assetPathPrefix}/ed80f.svg`;
const imgSetting = `${assetPathPrefix}/3a779.svg`;

// Quick Connect assets
const imgQcCancel = `${assetPathPrefix}/a3ed4.svg`;
const imgQcUnderline = `${assetPathPrefix}/eea73.svg`;
const imgQcActiveNotesPlus = `${assetPathPrefix}/958c9.svg`;
const imgQcUnion26 = `${assetPathPrefix}/0d568.svg`;
const imgQcRect2419 = `${assetPathPrefix}/02fe8.svg`;
const imgQcQr = `${assetPathPrefix}/7bb6e.svg`;
const imgQcAra = `${assetPathPrefix}/918e7.svg`;
const imgQcSliderThumb = `${assetPathPrefix}/2282e.svg`;
const imgQcSliderRing = `${assetPathPrefix}/6a9fa.svg`;
const imgQcAddBtn = `${assetPathPrefix}/04a34.svg`;
const imgQcArrowTilt = `${assetPathPrefix}/c0d8a.svg`;

// Spirometer + PFT screen assets
const imgSpiroBackArrow = `${assetPathPrefix}/f100c.svg`;
const imgPftBackArrow = `${assetPathPrefix}/1cf40.svg`;
const imgQuestionMark = `${assetPathPrefix}/90b7b.svg`;
const imgChevronRight = `${assetPathPrefix}/73b4f.svg`;

// Instructions + Test Execution screen assets
const imgInstrBackArrow = `${assetPathPrefix}/03e29.svg`;
const imgTestBackArrow = `${assetPathPrefix}/54876.svg`;
const imgSpirometer = `${assetPathPrefix}/74f23.svg`;
const imgConnectIcon = `${assetPathPrefix}/33c38.svg`;
const imgInstrRectangle5 = `${assetPathPrefix}/63419.svg`;
const imgTestRectangle5 = `${assetPathPrefix}/89a48.svg`;
const imgArrowDown = `${assetPathPrefix}/3e5bc.svg`;
const imgInstrIcon1 = `${assetPathPrefix}/2b7e1.svg`;  // mouthpiece
const imgInstrIcon2 = `${assetPathPrefix}/af918.svg`;  // inhale
const imgInstrIcon3 = `${assetPathPrefix}/fc90b.svg`;  // exhale
const imgInstrIcon4 = `${assetPathPrefix}/9bac3.svg`;  // breathe comfortably
const imgInstrRepeat = `${assetPathPrefix}/99b94.svg`; // repeat
const imgSlideIndicators = `${assetPathPrefix}/a6110.svg`;
const imgWaveform = `${assetPathPrefix}/b969d.svg`;

// Patient Demographics screen assets
const imgPdBackArrow = `${assetPathPrefix}/20b08.svg`;
const imgPdRectangle5 = `${assetPathPrefix}/90e0e.svg`;
const imgPdCalendar = `${assetPathPrefix}/fe844.svg`;
const imgPdArrowTilt = `${assetPathPrefix}/c0d8a.svg`;
const imgPdRadio = `${assetPathPrefix}/f17fa.svg`;
const imgPdRadioSelected = `${assetPathPrefix}/922c1.svg`;
const imgPdDivider = `${assetPathPrefix}/161ee.svg`;
const imgPdEye = `${assetPathPrefix}/500db.svg`;

// Ask panel assets
const imgQuickLogo = `${assetPathPrefix}/32f8f.svg`;
const imgArrowChevronDown = `${assetPathPrefix}/b4a2a.svg`;
const imgIconExd = `${assetPathPrefix}/263ee.svg`;
const imgAdd1 = `${assetPathPrefix}/214ff.svg`;
const imgIcon1 = `${assetPathPrefix}/c47a1.svg`;
const imgIcon2 = `${assetPathPrefix}/8276a.svg`;
const imgImage = `${assetPathPrefix}/de449.svg`;
const imgUnionAsk = `${assetPathPrefix}/14662.svg`;
const imgUnion = `${assetPathPrefix}/1ae20.svg`;
const imgRecording = `${assetPathPrefix}/f507c.svg`;
const imgDivider = `${assetPathPrefix}/09daf.svg`;
const imgRectangle4584 = `${assetPathPrefix}/9b742.png`;
const imgAdd = `${assetPathPrefix}/1865e.svg`;

// ─── Brand constants ──────────────────────────────────────────────────────────
const GRADIENT = "linear-gradient(135deg, #007A8B 0%, #3AAF4D 37%, #A8CB38 86%)";
const SF = "system-ui, -apple-system, sans-serif";


// ─── Shared ───────────────────────────────────────────────────────────────────
type StatusState = "Active" | "Pending" | "Discharge";

function StatusDot({ state = "Active" }: { state?: StatusState }) {
  const dot = state === "Discharge" ? imgEllipse43 : state === "Pending" ? imgEllipse42 : imgEllipse41;
  return (
    <div className="flex gap-[4px] items-center">
      <div className="relative shrink-0 size-[6px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={dot} />
      </div>
      <p className="text-[#434343] text-[16px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 500 }}>
        {state}
      </p>
    </div>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <div className={className ?? "h-[48px] relative w-[169.714px]"}>
      <div className="absolute contents inset-[12.5%_0.34%_11.36%_0.59%]">
        <div className="absolute inset-[13%_78.05%_11.48%_0.59%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup} />
        </div>
        <div className="absolute inset-[12.5%_0.34%_33.25%_24.32%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup1} />
        </div>
        <div className="absolute inset-[75.3%_3.63%_11.36%_24.46%]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup2} />
        </div>
      </div>
    </div>
  );
}

function InitialAvatar({ initials, size = 80, textSize = 28 }: { initials: string; size?: number; textSize?: number }) {
  return (
    <div
      className="bg-[#f7f7f7] flex items-center justify-center rounded-full shrink-0"
      style={{ width: size, height: size }}
    >
      <p className="text-[#8b8c8e] uppercase" style={{ fontFamily: SF, fontWeight: 400, fontSize: textSize }}>
        {initials}
      </p>
    </div>
  );
}

// ─── Patient row ──────────────────────────────────────────────────────────────
interface PatientRowProps {
  avatarSrc?: string;
  initials?: string;
  favoriteColor?: string;
  name: string;
  planOfCare: string;
  admissionDate: string;
  status: StatusState;
  textColor?: string;
  subColor?: string;
  className?: string;
}

function PatientRow({
  avatarSrc, initials, favoriteColor = "#007a8b", name,
  planOfCare, admissionDate, status,
  textColor = "#434343", subColor = "#8b8c8e", className,
}: PatientRowProps) {
  return (
    <div
      className={`bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] flex h-[114px] items-center px-[20px] rounded-[20px] w-full cursor-pointer hover:bg-gray-50 transition-colors${className ? ` ${className}` : ""}`}
    >
      <div className="flex flex-1 gap-[14px] items-center min-w-0">
        {/* Avatar wrapper — overflow visible so badge shows */}
        <div className="relative shrink-0 size-[80px]">
          <div className="rounded-[75px] overflow-hidden size-full flex items-center justify-center">
            {avatarSrc ? (
              <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full rounded-[75px]" src={avatarSrc} />
            ) : (
              <div className="bg-[#f7f7f7] flex flex-col items-center justify-center rounded-[100px] size-full">
                <p className="text-[#8b8c8e] text-[28px] text-center uppercase whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 400 }}>
                  {initials}
                </p>
              </div>
            )}
          </div>
          {/* Favorite badge — outside overflow-hidden */}
          <div
            className="absolute border-[1.5px] border-solid border-white flex items-center justify-center rounded-[40px] size-[26px]"
            style={{ backgroundColor: favoriteColor, top: "56px", left: "56px" }}
          >
            <img alt="" className="block size-[14px]" src={imgStar} />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-[8px] items-start justify-center min-w-0">
          <p className="text-[20px] text-center whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700, color: textColor }}>
            {name}
          </p>
          <div className="flex flex-col gap-[5px] items-start w-full">
            <p className="text-[18px] w-full" style={{ fontFamily: SF, fontWeight: 400, color: textColor }}>{planOfCare}</p>
            <p className="text-[16px] w-full" style={{ fontFamily: SF, fontWeight: 700, color: subColor }}>{admissionDate}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-[8px] items-center shrink-0">
        <StatusDot state={status} />
        <div className="h-[20px] relative shrink-0 w-[11px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgArrowCarrot} />
        </div>
      </div>
    </div>
  );
}

// ─── Quick Connect Screen ─────────────────────────────────────────────────────
function QuickConnectScreen({ onClose, onOpenAsk, onOpenSpiro }: { onClose: () => void; onOpenAsk: () => void; onOpenSpiro: () => void }) {
  const [sliderValue, setSliderValue] = useState(5);
  const [notes, setNotes] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 340);
  }

  return (
    <div
      className="fixed inset-0 z-40 bg-[#fcfcfc] flex flex-col overflow-hidden transition-transform duration-[340ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
      style={{ transform: visible ? "translateY(0)" : "translateY(100%)" }}
    >
      {/* Decorative BG blobs */}
      <div className="absolute h-[310px] left-0 opacity-70 overflow-clip top-0 w-full pointer-events-none">
        <div className="absolute contents inset-[0_0_0_25.15%]">
          <div className="absolute contents inset-[-37.81%_-8.99%_3.94%_78.66%]">
            <div className="absolute contents inset-[-37.81%_-8.99%_3.94%_78.66%]" style={{ containerType: "size" }}>
              <div className="absolute contents inset-[14.34%_-8.99%_56.1%_95.44%]" style={{ containerType: "size" }}>
                <div className="absolute flex inset-[-13.35%_-12.1%_28.44%_92.34%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                    <div className="mask-position-[-917.853px_41.403px,_42.352px_85.856px] mask-size-[1022.503px_310px,_185.144px_91.641px] relative size-full" style={{ maskImage: `url("${imgGroup6}"), url("${imgGroup7}")` }}>
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup8} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content column */}
      <div className="relative flex flex-col flex-1 min-h-0 px-[30px]">
        {/* Top nav row */}
        <div className="relative flex items-center h-[68px] shrink-0">
          <button onClick={handleClose} className="shrink-0 relative" style={{ width: 36, height: 36 }} aria-label="Close">
            <img alt="" className="absolute block inset-0 max-w-none" style={{ width: 34, height: "100%" }} src={imgQcCancel} />
          </button>
          <Logo className="h-[48px] absolute left-1/2 -translate-x-1/2 w-[169.714px]" />
        </div>

        {/* Heading + Active Notes button */}
        <div className="flex items-end justify-between shrink-0 mb-[20px]">
          <div>
            <h1 className="text-[#434343] text-[34px] leading-normal whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700 }}>
              Quick Connect
            </h1>
            <div className="h-[8px] w-[60px] mt-1">
              <img alt="" className="block w-full h-full" src={imgQcUnderline} />
            </div>
          </div>
          <button className="flex items-center gap-[3.6px] bg-[#007a8b] rounded-[10px] px-[18px] py-[14px] hover:opacity-90 transition-opacity shrink-0">
            <img alt="" className="size-[21.6px]" src={imgQcActiveNotesPlus} />
            <span className="text-white text-[18px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>Active Notes</span>
          </button>
        </div>

        {/* Scrollable inner content */}
        <div className="flex flex-col gap-[20px] flex-1 min-h-0 overflow-y-auto pb-[130px]">

          {/* Patient dropdown */}
          <div className="bg-white border-2 border-[#ececec] flex items-center rounded-[14px]" style={{ paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20 }}>
            <span className="flex-1 text-[#434343] text-[20px]" style={{ fontFamily: SF, fontWeight: 500 }}>Barry Thomson</span>
            <img alt="" className="size-[24px] shrink-0" src={imgQcArrowTilt} />
          </div>

          {/* Icon buttons row */}
          <div className="bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] flex gap-[40px] items-center p-[24px] rounded-[14px]">
            <button className="bg-[#f2f8f9] flex items-center justify-center overflow-clip rounded-full shrink-0 size-[90px] hover:bg-[#e0f2f5] transition-colors">
              <div className="relative size-[50px]">
                <div className="absolute inset-[5%_20.1%_18.37%_20.09%]">
                  <div className="absolute inset-[-0.28%_-0.35%]">
                    <img alt="" className="block max-w-none size-full" src={imgQcUnion26} />
                  </div>
                </div>
                <div className="absolute inset-[67.63%_25.58%_3.51%_25.85%]">
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgQcRect2419} />
                </div>
                <p className="absolute text-white text-[9.29px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700, inset: "75.66% 35.96% 11.84% 34.87%" }}>PRE</p>
              </div>
            </button>
            <button className="bg-[#f2f8f9] flex items-center justify-center overflow-clip rounded-full shrink-0 size-[90px] hover:bg-[#e0f2f5] transition-colors">
              <img alt="" className="size-[50px]" src={imgQcQr} />
            </button>
            <button className="bg-[#f2f8f9] flex items-center justify-center overflow-clip rounded-full shrink-0 size-[90px] hover:bg-[#e0f2f5] transition-colors" onClick={onOpenSpiro}>
              <img alt="" className="size-[50px]" src={imgQcAra} />
            </button>
          </div>

          {/* Skilled Time */}
          <div className="bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] flex flex-col gap-[24px] p-[24px] rounded-[14px]">
            <p className="text-[#434343] text-[24px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700 }}>Skilled Time</p>
            <div className="flex gap-[20px] items-center">
              <div className="flex-1 relative h-[25px]">
                <div className="absolute bg-[#ececec] rounded-full" style={{ top: "44%", bottom: "36%", left: 0, right: 0 }} />
                <div className="absolute bg-[#007a8b] h-[8px] left-0 rounded-full" style={{ top: "50%", transform: "translateY(-50%)", width: `${(sliderValue / 60) * 100}%` }} />
                <input type="range" min={0} max={60} value={sliderValue} onChange={e => setSliderValue(Number(e.target.value))} className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: "100%" }} />
                <div className="absolute -translate-x-1/2 -translate-y-1/2 size-[24px] pointer-events-none" style={{ left: `${(sliderValue / 60) * 100}%`, top: "50%" }}>
                  <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgQcSliderThumb} />
                </div>
              </div>
              <div className="bg-white border-2 border-[#ececec] flex items-center justify-center h-[64px] rounded-[10px] w-[110px]">
                <input type="number" min={0} max={60} value={sliderValue} onChange={e => setSliderValue(Math.min(60, Math.max(0, Number(e.target.value))))} className="text-[#434343] text-[24px] text-center w-full bg-transparent outline-none" style={{ fontFamily: SF, fontWeight: 500 }} />
              </div>
            </div>
          </div>

          {/* Progress Notes */}
          <div className="bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] flex flex-col gap-[24px] p-[24px] rounded-[14px]">
            <div className="flex items-center justify-between">
              <p className="text-[#434343] text-[24px]" style={{ fontFamily: SF, fontWeight: 700 }}>Progress Notes</p>
              <div className="flex gap-[16px] items-center">
                {(["Lung Sounds", "Vital Signs", "Eval"] as const).map((label, i) => (
                  <>
                    {i > 0 && <div key={`sep-${i}`} className="bg-[#ececec] h-[22px] w-[2px]" />}
                    <button key={label} className="flex gap-[4px] items-center hover:opacity-80 transition-opacity">
                      <img alt="" className="size-[24px]" src={imgQcAddBtn} />
                      <span className="text-[#007a8b] text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>{label}</span>
                    </button>
                  </>
                ))}
              </div>
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Write your notes here" className="bg-white border-2 border-[#ececec] h-[160px] p-[25px] rounded-[14px] resize-none outline-none text-[#434343] text-[20px] w-full" style={{ fontFamily: SF, fontWeight: 400 }} />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white drop-shadow-[0px_-6px_20px_rgba(77,77,79,0.1)] flex gap-[20px] items-center justify-end h-[100px] px-[30px] py-[10px]">
        <button className="bg-[#d9f4f9] flex items-center justify-center rounded-[10px] h-[64px] w-[264px] hover:bg-[#c5eef5] transition-colors">
          <span className="text-[#007a8b] text-[24px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>Save to Active Notes</span>
        </button>
        <button className="bg-[#007a8b] flex items-center justify-center rounded-[10px] h-[64px] w-[264px] hover:opacity-90 transition-opacity">
          <span className="text-white text-[24px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>Transmit to EMR</span>
        </button>
      </div>

      {/* Ask! button — inside sheet, fixed so it floats above */}
      <div className="fixed bottom-6 right-6" style={{ zIndex: 41 }}>
        <div className="relative">
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 blur-[10px] h-[30px] w-[110px] rounded-full opacity-70" style={{ backgroundImage: GRADIENT }} />
          <button className="relative h-[56px] w-[130px] rounded-full flex items-center gap-2.5 px-4 overflow-hidden hover:opacity-90 transition-opacity" style={{ backgroundImage: GRADIENT }} onClick={onOpenAsk}>
            <img alt="" className="size-[28px] shrink-0" src={imgIcon} />
            <p className="text-white text-[18px] font-medium mr-3" style={{ fontFamily: SF }}>Ask!</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Spirometer Screen ───────────────────────────────────────────────────────
const spiroDevices = [
  { name: "SPIROBANK OXI", serial: "SE-011-E010832" },
  { name: "Spirobank Smart", serial: "SM-005-Z117698" },
  { name: "Spirobank Smart", serial: "SM-005-Z117694" },
];

function SpiorometerScreen({ onBack, onConnect }: { onBack: () => void; onConnect: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      {/* BG decoration */}
      <div className="absolute h-[310px] left-0 opacity-70 overflow-clip top-0 w-full pointer-events-none">
        <div className="absolute contents inset-[0_0_0_25.15%]">
          <div className="absolute contents inset-[-37.81%_-8.99%_3.94%_78.66%]">
            <div className="absolute contents inset-[-37.81%_-8.99%_3.94%_78.66%]" style={{ containerType: "size" }}>
              <div className="absolute contents inset-[14.34%_-8.99%_56.1%_95.44%]" style={{ containerType: "size" }}>
                <div className="absolute flex inset-[-13.35%_-12.1%_28.44%_92.34%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                    <div className="mask-position-[-917.853px_41.403px,_42.352px_85.856px] mask-size-[1022.503px_310px,_185.144px_91.641px] relative size-full" style={{ maskImage: `url("${imgGroup6}"), url("${imgGroup7}")` }}>
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup8} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-[30px] pt-[14px] shrink-0">
        {/* Top nav row: back arrow + centered logo */}
        <div className="relative flex items-center h-[52px]">
          <button onClick={onBack} className="size-[30px] relative shrink-0" aria-label="Back">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSpiroBackArrow} />
          </button>
          <Logo className="h-[48px] absolute left-1/2 -translate-x-1/2 w-[169.714px]" />
        </div>

        {/* Title + BT links on same row */}
        <div className="flex items-center justify-between mt-[10px]">
          <div>
            <h1 className="text-[#434343] text-[34px]" style={{ fontFamily: SF, fontWeight: 700 }}>Spirometer</h1>
            <div className="h-[8px] w-[60px] mt-[6px] relative">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle5} />
            </div>
          </div>
          <div className="flex items-center gap-0">
            <button className="px-[16px] py-[10px]">
              <span className="text-[#007a8b] text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>Bluetooth Setting</span>
            </button>
            <div className="bg-[#ececec] h-[22px] w-[2px] mx-[2px]" />
            <button className="px-[16px] py-[10px]">
              <span className="text-[#007a8b] text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>Scan Devices</span>
            </button>
          </div>
        </div>
      </div>

      {/* Device list */}
      <div className="flex-1 overflow-y-auto px-[30px] py-[20px] flex flex-col gap-[16px]">
        {spiroDevices.map((device, i) => (
          <div key={i} className="bg-white border border-[#e8e8e8] flex items-center gap-[14px] px-[20px] rounded-[14px]" style={{ minHeight: 100, boxShadow: "0px 0px 5px rgba(77,77,79,0.08)" }}>
            <div className="flex flex-col gap-[6px] flex-1 min-w-0 py-[24px]">
              <p className="text-[#434343] text-[20px]" style={{ fontFamily: SF, fontWeight: 700 }}>{device.name}</p>
              <p className="text-[#8b8c8e] text-[18px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 400 }}>{device.serial}</p>
            </div>
            <button
              onClick={onConnect}
              className="bg-[#007a8b] flex items-center justify-center rounded-[10px] hover:opacity-90 transition-opacity shrink-0"
              style={{ padding: "14px 32px" }}
            >
              <span className="text-white text-[18px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>Connect</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pulmonary Function Test Screen ──────────────────────────────────────────
const pftOptions = [
  { label: "Expiratory Maneuver" },
  { label: "Expiratory / Inspiratory Maneuver" },
];

function PulmonaryFunctionScreen({ onBack, onOpenPatientDemo }: { onBack: () => void; onOpenPatientDemo: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      {/* BG decoration */}
      <div className="absolute h-[310px] left-0 opacity-70 overflow-clip top-0 w-full pointer-events-none">
        <div className="absolute contents inset-[0_0_0_25.15%]">
          <div className="absolute contents inset-[-37.81%_-8.99%_3.94%_78.66%]">
            <div className="absolute contents inset-[-37.81%_-8.99%_3.94%_78.66%]" style={{ containerType: "size" }}>
              <div className="absolute contents inset-[14.34%_-8.99%_56.1%_95.44%]" style={{ containerType: "size" }}>
                <div className="absolute flex inset-[-13.35%_-12.1%_28.44%_92.34%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                    <div className="mask-position-[-917.853px_41.403px,_42.352px_85.856px] mask-size-[1022.503px_310px,_185.144px_91.641px] relative size-full" style={{ maskImage: `url("${imgGroup6}"), url("${imgGroup7}")` }}>
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup8} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-[30px] pt-[14px] shrink-0">
        <div className="relative flex items-center h-[52px]">
          <button onClick={onBack} className="size-[30px] relative shrink-0" aria-label="Back">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPftBackArrow} />
          </button>
          <Logo className="h-[48px] absolute left-1/2 -translate-x-1/2 w-[169.714px]" />
        </div>
        <div className="mt-[10px]">
          <h1 className="text-[#434343] text-[34px]" style={{ fontFamily: SF, fontWeight: 700 }}>Select Pulmonary Function Test</h1>
          <div className="h-[8px] w-[60px] mt-1 relative">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle5} />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex-1 overflow-y-auto px-[30px] py-[20px] flex flex-col gap-[20px]">
        {pftOptions.map((opt, i) => (
          <button
            key={i}
            onClick={i === 0 ? onOpenPatientDemo : undefined}
            className="bg-[#f2f8f9] flex items-center h-[70px] px-[24px] rounded-[14px] w-full hover:bg-[#e0f2f5] transition-colors text-left"
          >
            <div className="flex items-center gap-[5px] flex-1 min-w-0">
              <span className="text-[#007a8b] text-[22px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700 }}>{opt.label}</span>
              <div className="relative size-[22px] shrink-0 self-start mt-[-4px]">
                <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgQuestionMark} />
              </div>
            </div>
            <div className="relative shrink-0 size-[22px]">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChevronRight} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── ARA steps data ───────────────────────────────────────────────────────────
const araSteps = [
  { title: "Quick Connect", body: "Open the ACPlus app and tap the Quick Connect icon in the top navigation bar to access patient management tools." },
  { title: "Select Patient", body: "Search for or tap the patient you want to assess from the patient list. Confirm their name and date of birth." },
  { title: "Connect Spirometer via Bluetooth", body: "Ensure the spirometer device is powered on. Navigate to Device Settings and pair via Bluetooth before proceeding." },
  { title: "Select Test Type", body: "Inside the patient record, tap 'ARA Assessment' and choose the appropriate test type: FVC, FEV1, or Peak Flow." },
  { title: "Patient Details", body: "Verify patient demographics — height, weight, age, and smoking history — as these affect reference values." },
  { title: "Review Test Instructions", body: "Read aloud the on-screen instructions to the patient. Ensure they understand the breathing technique before starting." },
  { title: "Start Test", body: "Tap 'Begin Test'. The spirometer will display a countdown. Instruct the patient to inhale fully, then exhale forcefully." },
  { title: "Execute Trials", body: "Complete a minimum of 3 acceptable trials. The app highlights the best effort automatically based on ATS/ERS criteria." },
  { title: "Review ARA Results", body: "Results display FEV1, FVC, FEV1/FVC ratio, and percent-predicted values. A color-coded severity indicator is shown." },
  { title: "Post-Assessment Actions", body: "Tap 'Save & Sync' to push results to the EMR. Add clinical notes, flag for physician review, or schedule a follow-up." },
];

// ─── Chat panel ───────────────────────────────────────────────────────────────
type ChatPhase = "idle" | "thinking" | "answered";

/** The chat was opened while the interactive guide is running. */
interface AskGuide {
  /** e.g. "Connect device · Michael M. Jonathan" */
  label: string;
  reply: (text: string) => AssistantReply;
  onChip: (chip: ReplyChip) => void;
  /** Transcript sent from the guide's Speak button: shown as the user's message. */
  voiceMessage?: string;
}

interface AskPanelProps {
  onClose: () => void;
  onStartGuide: () => void;
  slideOut?: boolean;
  guide?: AskGuide;
}

/** Renders **bold** spans in scripted replies. */
function richText(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong> : part,
  );
}

function GuideChip({ label, onClick, back }: { label: string; onClick: () => void; back?: boolean }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 hover:bg-gray-50 transition-colors"
      style={{ width: "fit-content", background: "#FFFFFF", boxShadow: "0px 4px 20px rgba(4,6,15,0.08)", borderRadius: 100, padding: "8px 14px", border: "1px solid #E3EEF0" }}>
      {back && <span aria-hidden="true" style={{ color: "#007A8B", fontSize: 15, lineHeight: 1 }}>←</span>}
      <span style={{ fontFamily: SF, fontWeight: 500, fontSize: 15, color: back ? "#007A8B" : "#0F0F0F" }}>{label}</span>
    </button>
  );
}

const GUIDE_REPLY_DELAY = 1600;

function AskPanel({ onClose, onStartGuide, slideOut = false, guide }: AskPanelProps) {
  const [inputText, setInputText] = useState("");
  const [phase, setPhase] = useState<ChatPhase>(guide?.voiceMessage ? "thinking" : "idle");
  const [guideUser, setGuideUser] = useState(guide?.voiceMessage ?? "");
  const [guideReply, setGuideReply] = useState<AssistantReply | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const charCount = inputText.length;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [phase]);

  // Guide mode: answer the voice transcript; focus the panel or the reply
  useEffect(() => {
    if (!guide) return;
    if (!guide.voiceMessage) { inputRef.current?.focus({ preventScroll: true }); return; }
    const t = setTimeout(() => { setGuideReply(guide.reply(guide.voiceMessage!)); setPhase("answered"); }, GUIDE_REPLY_DELAY);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (guide && phase === "answered") replyRef.current?.focus({ preventScroll: true });
  }, [guide, phase]);
  useEffect(() => {
    if (!guide) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [guide, onClose]);

  function handleSend() {
    if (!inputText.trim()) return;
    setPhase("thinking");
    if (guide) {
      const text = inputText.trim();
      setGuideUser(text);
      setGuideReply(null);
      setTimeout(() => { setGuideReply(guide.reply(text)); setPhase("answered"); }, GUIDE_REPLY_DELAY);
    } else {
      setTimeout(() => setPhase("answered"), 2800);
    }
    setInputText("");
  }

  function handleSuggestion(q: string) {
    setInputText(q);
    inputRef.current?.focus();
  }

  const suggestions = [
    "How do I perform ARA Assessment?",
    "How do I log in to ACPlus for the first time?",
    "I'm not sure which login option I should use.",
    "My facility uses Microsoft can I log in with my Microsoft account?",
    "I forgot my ACPlus password how do I reset it?",
  ];

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Overlay — over the guide, the guide dims itself instead */}
      <div className={guide ? "absolute inset-0" : "absolute inset-0 backdrop-blur-[4px]"} style={{ background: guide ? "transparent" : "rgba(67,67,67,0.65)" }} onClick={onClose} />

      {/* Panel */}
      <div className="absolute right-0 flex flex-col bg-white shadow-2xl" style={{ width: "42%", minWidth: 440, top: 15, bottom: 15, right: 15, borderRadius: 40, transform: slideOut ? "translateX(110%)" : "translateX(0)", transition: "transform 250ms ease" }}>

        {/* Panel header */}
        <div className="flex items-center px-6 pt-6 pb-0 shrink-0">
          <img alt="ACPlus" style={{ width: 53, height: 53, objectFit: "contain" }} src={imgQuickLogo} />
          <div className="flex-1" />
          {/* Expand button */}
          <button
            className="flex items-center justify-center hover:bg-[#e5e5e5] transition-colors shrink-0"
            style={{ width: 44, height: 44, background: "#EFEFEF", borderRadius: 8 }}
            aria-label="Expand"
          >
            <img alt="" src={imgIconExd} style={{ width: 20, height: 20 }} />
          </button>
          <div style={{ width: 8 }} />
          {/* Chevron-down / close button */}
          <button
            className="flex items-center justify-center hover:bg-[#e5e5e5] transition-colors shrink-0"
            style={{ width: 44, height: 44, background: "#EFEFEF", borderRadius: 8 }}
            onClick={onClose}
            aria-label="Close"
          >
            <img alt="" src={imgArrowChevronDown} style={{ width: 20, height: 20 }} />
          </button>
        </div>

        {/* Chat body */}
        <div className="flex-1 overflow-y-auto flex flex-col" style={{ paddingTop: 6, paddingRight: 24, paddingBottom: 6, paddingLeft: 24, rowGap: 13, columnGap: 20 }}>

          {/* Where the clinician is in the guide */}
          {guide && (
            <div className="flex items-center gap-2 self-start" style={{ background: "#F0F5F6", borderRadius: 100, padding: "6px 12px", marginTop: 6 }}>
              <span aria-hidden="true" className="size-1.5 rounded-full" style={{ background: "#007A8B" }} />
              <span style={{ fontFamily: SF, fontSize: 13, color: "#434343" }}>
                <span style={{ fontWeight: 600 }}>Guiding:</span> {guide.label}
              </span>
            </div>
          )}

          {phase === "idle" && (
            <>
              {/* Gradient heading */}
              <p
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: GRADIENT,
                  fontFamily: "'Proxima Nova:Bold', 'Proxima Nova', system-ui, sans-serif",
                  fontWeight: 900,
                  fontSize: 44,
                  lineHeight: "52px",
                  marginTop: 12,
                  marginRight: 0,
                  marginBottom: 0,
                  marginLeft: 0,
                }}
              >
                How can I help<br />you today?
              </p>

              {/* Gradient divider */}
              <div style={{ width: "100%", marginBottom: 4 }}>
                <img alt="" src={imgDivider} style={{ width: "100%", display: "block" }} />
              </div>

              {/* Suggestion pills */}
              <div className="flex flex-col" style={{ gap: "8px 12px" }}>
                {guide && <GuideChip back label="Back to guide" onClick={() => guide.onChip({ label: "Back to guide", action: { type: "back" } })} />}
                {suggestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(q)}
                    className="text-left hover:bg-gray-50 transition-colors"
                    style={{
                      width: "fit-content",
                      background: "#FFFFFF",
                      boxShadow: "0px 4px 20px rgba(4,6,15,0.08)",
                      borderRadius: 100,
                      paddingTop: 8,
                      paddingRight: 14,
                      paddingBottom: 8,
                      paddingLeft: 14,
                    }}
                  >
                    <p style={{ fontFamily: SF, fontWeight: 300, fontSize: 15, color: "#0F0F0F", margin: 0 }}>{q}</p>
                  </button>
                ))}
                {/* More pill */}
                <button
                  className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
                  style={{
                    width: "fit-content",
                    background: "#FFFFFF",
                    boxShadow: "0px 4px 20px rgba(4,6,15,0.08)",
                    borderRadius: 100,
                    paddingTop: 8,
                    paddingRight: 14,
                    paddingBottom: 8,
                    paddingLeft: 14,
                  }}
                >
                  <img alt="" src={imgAdd} style={{ width: 16, height: 16 }} />
                  <p style={{ fontFamily: SF, fontWeight: 300, fontSize: 15, color: "#0F0F0F", margin: 0 }}>More</p>
                </button>
              </div>
            </>
          )}

          {phase === "thinking" && (
            <>
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]" style={{ background: GRADIENT }}>
                  <p className="text-white text-[15px]" style={{ fontFamily: SF, fontWeight: 500 }}>
                    {guide ? guideUser : "How do I perform ARA Assessment?"}
                  </p>
                </div>
              </div>
              {/* Thinking */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full flex items-center justify-center shrink-0" style={{ background: GRADIENT }}>
                    <img alt="" className="size-4" src={imgIcon} />
                  </div>
                  <p className="text-[#434343] text-[15px] font-semibold" style={{ fontFamily: SF }}>Thinking…</p>
                </div>
                <div className="ml-9 flex flex-col gap-1">
                  {[
                    "Generating response… Creating a clear reply.",
                    "Gathering insights… Putting it all together.",
                  ].map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-[#A8CB38] animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                      <p className="text-[#8b8c8e] text-[13px]" style={{ fontFamily: SF }}>{line}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {phase === "answered" && guide && guideReply && (
            <>
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]" style={{ background: GRADIENT }}>
                  <p className="text-white text-[15px]" style={{ fontFamily: SF, fontWeight: 500 }}>{guideUser}</p>
                </div>
              </div>
              <div ref={replyRef} tabIndex={-1} className="flex flex-col gap-3 outline-none" aria-label="ACPlus AI reply">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full flex items-center justify-center shrink-0" style={{ background: GRADIENT }}>
                    <img alt="" className="size-4" src={imgIcon} />
                  </div>
                  <p className="text-[#434343] text-[14px] font-semibold" style={{ fontFamily: SF }}>ACPlus AI</p>
                </div>
                <div className="ml-9 flex flex-col gap-3">
                  {guideReply.blocks.map((b, i) =>
                    b.kind === "p" ? (
                      <p key={i} className="text-[#434343] text-[14px] leading-relaxed" style={{ fontFamily: SF }}>{richText(b.text)}</p>
                    ) : b.kind === "ul" ? (
                      <ul key={i} className="flex flex-col gap-1 pl-5 list-disc text-[#434343] text-[14px] leading-relaxed" style={{ fontFamily: SF }}>
                        {b.items.map((it, j) => <li key={j}>{richText(it)}</li>)}
                      </ul>
                    ) : (
                      <ol key={i} className="flex flex-col gap-1 pl-5 list-decimal text-[#434343] text-[14px] leading-relaxed" style={{ fontFamily: SF }}>
                        {b.items.map((it, j) => <li key={j}>{richText(it)}</li>)}
                      </ol>
                    ),
                  )}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {guideReply.chips.map(chip => (
                      <GuideChip key={chip.label} label={chip.label} back={chip.action.type === "back" && chip.label === "Back to guide"}
                        onClick={() => guide.onChip(chip)} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {phase === "answered" && !guide && (
            <>
              {/* User bubble */}
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]" style={{ background: GRADIENT }}>
                  <p className="text-white text-[15px]" style={{ fontFamily: SF, fontWeight: 500 }}>
                    {guide ? guideUser : "How do I perform ARA Assessment?"}
                  </p>
                </div>
              </div>

              {/* Assistant answer */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full flex items-center justify-center shrink-0" style={{ background: GRADIENT }}>
                    <img alt="" className="size-4" src={imgIcon} />
                  </div>
                  <p className="text-[#434343] text-[14px] font-semibold" style={{ fontFamily: SF }}>ACPlus AI</p>
                </div>

                <div className="ml-9 flex flex-col gap-3">
                  <p className="text-[#434343] text-[14px]" style={{ fontFamily: SF }}>
                    Here's how to perform an ARA Assessment in ACPlus:
                  </p>
                  {araSteps.map((step, i) => (
                    <div key={i} className="flex flex-col gap-0.5">
                      <p className="text-[#434343] text-[14px]" style={{ fontFamily: SF, fontWeight: 700 }}>
                        Step {i + 1}: {step.title}
                      </p>
                      <p className="text-[#6e6f72] text-[13px] leading-relaxed" style={{ fontFamily: SF }}>
                        {step.body}
                      </p>
                    </div>
                  ))}

                  {/* CTA */}
                  <button
                    onClick={onStartGuide}
                    className="mt-3 w-full text-left rounded-2xl px-4 py-4 hover:brightness-95 transition-all active:scale-[0.98]"
                    style={{ backgroundColor: "#f0f5f6" }}
                  >
                    <p className="text-[14px] leading-relaxed mb-2" style={{ fontFamily: SF, color: "#434343" }}>
                      Do you want to be guided through the whole process step by step?
                    </p>
                    <p className="text-[15px] font-semibold flex items-center gap-2" style={{ fontFamily: SF, color: "#007A8B" }}>
                      Start the Interactive Guide
                      <span className="text-[18px] leading-none">→</span>
                    </p>
                  </button>
                </div>
              </div>
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="px-5 pb-5 pt-3 shrink-0">
          {/* Gradient glow card */}
          <div className="relative">
            <div className="absolute inset-0 rounded-[24px] blur-[18px] opacity-30" style={{ backgroundImage: GRADIENT }} />
            <div className="relative bg-white rounded-[24px] px-5 pt-5 pb-4 flex flex-col" style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.06)", rowGap: 0, columnGap: 12 }}>
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                rows={2}
                className="w-full resize-none outline-none bg-transparent"
                style={{ fontFamily: SF, fontSize: 15, fontWeight: 300, color: "#434343", lineHeight: "22px" }}
                placeholder="Ask me anything..."
              />
              {/* Bottom action row */}
              <div className="flex items-center gap-2">
                {/* + button */}
                <button
                  className="flex items-center justify-center hover:bg-[#e5e5e5] transition-colors shrink-0"
                  style={{ width: 36, height: 36, background: "#EFEFEF", borderRadius: 8 }}
                  aria-label="Add"
                >
                  <img alt="" src={imgAdd1} style={{ width: 14, height: 14 }} />
                </button>
                {/* Token chip */}
                <div
                  className="flex items-center gap-1.5 shrink-0"
                  style={{ background: "#F5F5F5", borderRadius: 100, padding: "5px 12px 5px 8px" }}
                >
                  <img alt="" src={imgIcon1} style={{ width: 18, height: 18 }} />
                  <span style={{ fontFamily: SF, fontWeight: 600, fontSize: 13, color: "#434343" }}>
                    {charCount > 0 ? charCount : "773"}
                  </span>
                  <span style={{ fontFamily: SF, fontWeight: 400, fontSize: 13, color: "#8B8C8E" }}>/2K</span>
                </div>
                <div className="flex-1" />
                {/* Image icon */}
                <img alt="" src={imgImage} style={{ width: 22, height: 22 }} className="shrink-0" />
                {/* Gradient circular send button */}
                <button
                  onClick={handleSend}
                  className="flex items-center justify-center hover:opacity-90 transition-opacity shrink-0"
                  style={{ width: 57, height: 57, borderRadius: "50%", backgroundImage: GRADIENT }}
                  aria-label="Send"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-center text-[#8b8c8e] mt-2 px-2 leading-relaxed" style={{ fontFamily: SF }}>
            AI-generated responses may be inaccurate or misleading. Be sure to double-check responses and sources.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const recentlyViewed: { name: string; initials?: string; avatar?: string }[] = [
  { initials: "DK", name: "Dev Kyle" },
  { initials: "KW", name: "Kate" },
  { name: "Jennifer", avatar: imgFrame4771 },
  { name: "Simon", avatar: imgFrame4772 },
  { initials: "DW", name: "David" },
  { name: "Trish", avatar: imgFrame4773 },
  { name: "Sasha", avatar: imgFrame4774 },
];

const allPatients = [
  { avatarSrc: imgAvatar, name: "John S. Doe", planOfCare: "Plan of Care: PT | EMR Synced: Y", admissionDate: "Admission Date: 2020-08-19", status: "Active" as StatusState, favoriteColor: "#007a8b" },
  { avatarSrc: imgAvatar1, name: "John S. Doe", planOfCare: "Plan of Care: PT | EMR Synced: Y", admissionDate: "Admission Date: 2020-08-19", status: "Pending" as StatusState, favoriteColor: "#599400", textColor: "#212121", subColor: "#999" },
  { avatarSrc: imgAvatar2, name: "John S. Doe", planOfCare: "Plan of Care: PT | EMR Synced: Y", admissionDate: "Admission Date: 2020-08-19", status: "Discharge" as StatusState, favoriteColor: "#007a8b" },
  { initials: "DK", name: "Dev Kyle", planOfCare: "Plan of Care: PT | EMR Synced: Y", admissionDate: "Admission Date: 2020-08-19", status: "Active" as StatusState, favoriteColor: "#007a8b" },
  { avatarSrc: imgAvatar3, name: "Alan G. Samson", planOfCare: "Plan of Care: PT | EMR Synced: Y", admissionDate: "Admission Date: 2020-08-19", status: "Discharge" as StatusState, favoriteColor: "#007a8b" },
  { initials: "AA", name: "Anna Nugyen", planOfCare: "Plan of Care: PT | EMR Synced: Y", admissionDate: "Admission Date: 2020-08-19", status: "Pending" as StatusState, favoriteColor: "#599400", textColor: "#212121", subColor: "#999" },
  { avatarSrc: imgFrame4774, name: "Sasha Wilson", planOfCare: "Plan of Care: PT | EMR Synced: Y", admissionDate: "Admission Date: 2020-08-19", status: "Active" as StatusState, favoriteColor: "#007a8b" },
];

// ─── Shared: Device serial badge ─────────────────────────────────────────────
function SerialBadge({ serial }: { serial?: string }) {
  return (
    <div className="absolute right-0 top-[10.5px] bg-[#f7faf2] border border-[#eaf3da] flex items-center gap-[8px] px-[12px] py-[6px] rounded-[8px]">
      <div className="relative overflow-clip shrink-0 size-[36px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSpirometer} />
        <div className="absolute left-[14px] size-[16px] top-[20px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgConnectIcon} />
        </div>
      </div>
      <span className="text-[#434343] text-[18px] tracking-[-0.54px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>
        {serial ?? "SE-011-E010832"}
      </span>
    </div>
  );
}

// ─── Screen 7: Instructions ───────────────────────────────────────────────────
const instrSteps = [
  { icon: imgInstrIcon1, text: "Have the patient close their lips around the mouthpiece." },
  { icon: imgInstrIcon2, text: "The patient should inhale quickly and deeply." },
  { icon: imgInstrIcon3, text: `Then without hesitation, have the patient exhale quickly and fully until the 6-seconds exhalation timer expires. Instruct patient to "blast your air out".` },
  { icon: imgInstrIcon3, text: "The patient should inhale again rapidly and deeply until the 6-second inhalation timer expires." },
  { icon: imgInstrIcon4, text: "Remove mouthpiece and instruct patient to breathe comfortably until the next trial." },
  { icon: imgInstrIcon1, text: "When ready, cue patient to prepare for the next trial." },
  { icon: imgInstrRepeat, text: "Repeat procedure until at least 3 acceptable trials are achieved (older adults may complete up to 8 trails).", rotate: true },
];

function InstructionsScreen({ onBack, onStartTest, onWarmUp }: { onBack: () => void; onStartTest: () => void; onWarmUp: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative px-[30px] pt-[14px] shrink-0">
        <div className="relative flex items-center h-[52px]">
          <button onClick={onBack} className="size-[30px] relative shrink-0" aria-label="Back">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgInstrBackArrow} />
          </button>
          <Logo className="h-[48px] absolute left-1/2 -translate-x-1/2 w-[169.714px]" />
          <SerialBadge />
        </div>
        <div className="mt-[18px]">
          <h1 className="text-[#434343] text-[34px]" style={{ fontFamily: SF, fontWeight: 700 }}>
            Instructions for Expiratory / Inspiratory Maneuver
          </h1>
          <div className="h-[8px] w-[60px] mt-[18px] relative">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgInstrRectangle5} />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-[30px] py-[20px] flex flex-col gap-[20px]">
        <p className="text-[#434343] text-[22px] leading-[28px]" style={{ fontFamily: SF, fontWeight: 400 }}>
          The objective data can only be valid when the clinician adheres to the correct procedure below. Patient should be sitting with upright posture.  Apply nose clip (optional) and guide the patient as follows:
        </p>
        <div className="flex flex-col gap-[20px]">
          {instrSteps.map((step, i) => (
            <div key={i} className="flex gap-[15px] items-center">
              <div className="relative shrink-0 size-[60px]">
                <img
                  alt=""
                  className="absolute block inset-0 max-w-none size-full"
                  src={step.icon}
                  style={step.rotate ? { transform: "rotate(180deg) scaleY(-1)" } : undefined}
                />
              </div>
              <p className="flex-1 text-[#434343] text-[20px] leading-[38px]" style={{ fontFamily: SF, fontWeight: 500 }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[#434343] text-[22px] leading-[28px]" style={{ fontFamily: SF, fontWeight: 400 }}>
          Press the <span style={{ fontWeight: 600 }}>'Start Test'</span> button at the bottom of this screen to begin Trail 1.{" "}
          A 10-second countdown timer will appear.
        </p>
      </div>

      {/* Bottom buttons */}
      <div className="bg-white drop-shadow-[0px_-6px_20px_rgba(77,77,79,0.1)] flex items-center justify-end gap-[20px] px-[30px] py-[10px] h-[120px] shrink-0">
        <button
          onClick={onWarmUp}
          className="flex items-center justify-center px-[20px] py-[20px] rounded-[10px] w-[264px] hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#d9f4f9" }}
        >
          <span className="text-[#007a8b] text-[24px]" style={{ fontFamily: SF, fontWeight: 600 }}>Warm Up</span>
        </button>
        <button
          onClick={onStartTest}
          className="bg-[#007a8b] flex items-center justify-center px-[20px] py-[20px] rounded-[10px] w-[264px] hover:opacity-90 transition-opacity"
        >
          <span className="text-white text-[24px]" style={{ fontFamily: SF, fontWeight: 600 }}>Start Test</span>
        </button>
      </div>
    </div>
  );
}

// ─── Screen 8: Test Execution ─────────────────────────────────────────────────
function FlowVolumeChart({ showWaveform }: { showWaveform: boolean }) {
  const yLabels = [6, 4, 2, 0, -2, -4, -6];
  const xLabels = ["0.0", "1.0", "2.0", "3.0", "4.0"];

  // Waveform path drawn as SVG
  const waveformPath = `M 0 168 C 20 168 30 155 50 148 L 70 142 C 90 134 110 125 140 118
    C 165 113 185 110 210 108 C 235 106 250 108 270 110 C 300 115 310 120 330 118
    C 360 115 380 112 410 112 C 445 113 460 115 490 118 C 520 122 535 128 555 135
    C 570 140 575 148 585 155 C 595 162 600 168 610 170 C 625 174 635 176 650 180
    C 670 185 680 188 700 192 C 715 196 720 198 730 200 C 745 202 750 202 760 201
    C 775 198 780 194 790 192 C 810 188 820 188 840 190 C 860 193 870 197 880 198
    C 900 200 910 199 920 197 C 940 193 950 188 960 185 C 975 180 980 178 990 178
    C 1010 178 1020 180 1040 183 C 1060 186 1070 188 1085 188 C 1100 188 1110 186 1130 182
    C 1145 178 1148 175 1152 168`;

  return (
    <div className="w-full h-full relative">
      <svg width="100%" height="100%" viewBox="0 0 1300 552" preserveAspectRatio="none">
        {/* Y-axis label (rotated) */}
        <text
          x="8" y="276"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fill="#8b8c8e"
          fontFamily="system-ui"
          fontWeight="600"
          transform="rotate(-90, 8, 276)"
        >Flow (L/s)</text>

        {/* Y axis numbers */}
        {yLabels.map((v, i) => (
          <text key={v} x="60" y={40 + i * 64} textAnchor="end" dominantBaseline="middle" fontSize="14" fill="#c5c5c7" fontFamily="system-ui">{v}</text>
        ))}

        {/* Chart area */}
        {/* Vertical grid lines */}
        {[203, 390, 577, 765, 954].map((x, i) => (
          <line key={i} x1={70 + x} y1="18" x2={70 + x} y2="456" stroke="#f2f8f9" strokeWidth="1" />
        ))}

        {/* Horizontal grid lines */}
        {[0, 56, 112, 224, 280, 336].map((y, i) => (
          <line key={i} x1="70" y1={18 + y} x2="1222" y2={18 + y} stroke="#f2f8f9" strokeWidth="1" />
        ))}

        {/* Zero line (gray) */}
        <line x1="70" y1="186" x2="1222" y2="186" stroke="#d9d9d9" strokeWidth="1" />
        {/* Left vertical axis */}
        <line x1="70" y1="18" x2="70" y2="456" stroke="#d9d9d9" strokeWidth="1" />

        {/* Waveform */}
        {showWaveform && (
          <path
            d={waveformPath}
            fill="none"
            stroke="#007a8b"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            transform="translate(70, 18)"
          />
        )}

        {/* X axis numbers */}
        {xLabels.map((v, i) => (
          <text key={v} x={70 + 203 + i * 187} y="490" textAnchor="middle" fontSize="14" fill="#c5c5c7" fontFamily="system-ui">{v}</text>
        ))}

        {/* X axis label */}
        <text x="646" y="520" textAnchor="middle" fontSize="14" fill="#8b8c8e" fontFamily="system-ui" fontWeight="600">Volume(L)</text>
      </svg>
    </div>
  );
}

function TestExecutionScreen({ onBack, onEndTest, patientName, deviceSerial, testType }: { onBack: () => void; onEndTest: () => void; patientName?: string; deviceSerial?: string; testType?: string }) {
  const [trialDot] = useState(0); // 0 = first trial active
  const [showCard, setShowCard] = useState(true);
  const [phase, setPhase] = useState<"exhale" | "inhale">("exhale");
  const [showWaveform, setShowWaveform] = useState(true);
  const dots = 3;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="relative px-[30px] pt-[14px] shrink-0">
        <div className="relative flex items-center h-[52px]">
          <button onClick={onBack} className="size-[30px] relative shrink-0" aria-label="Back">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTestBackArrow} />
          </button>
          <Logo className="h-[48px] absolute left-1/2 -translate-x-1/2 w-[169.714px]" />
          <SerialBadge serial={deviceSerial} />
        </div>
        <div className="flex items-start justify-between mt-[18px]">
          <div>
            <h1 className="text-[#212121] text-[34px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700 }}>
              {testType ?? "Expiratory / Inspiratory Maneuver"}
            </h1>
            <div className="h-[8px] w-[60px] mt-[18px] relative">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTestRectangle5} />
            </div>
          </div>
          {/* Trial counter + phase */}
          <div className="flex flex-col items-center gap-[4px]">
            <span className="text-[40px] leading-none" style={{ fontFamily: SF, fontWeight: 700, color: "#599400" }}>05</span>
            <span className="text-[16px]" style={{ fontFamily: SF, fontWeight: 600, color: "#599400" }}>
              {phase === "exhale" ? "Exhale" : "Inhale"}
            </span>
          </div>
        </div>
      </div>

      {/* End Test pill button */}
      <div className="px-[30px] mt-[12px] flex shrink-0">
        <button
          onClick={onEndTest}
          className="flex items-center justify-center px-[24px] py-[10px] rounded-full hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#e10e0e" }}
        >
          <span className="text-white text-[18px]" style={{ fontFamily: SF, fontWeight: 600 }}>End Test</span>
        </button>
      </div>

      {/* Chart card */}
      <div className="flex-1 overflow-hidden px-[30px] mt-[12px] flex flex-col gap-[12px]">
        <div className="bg-white rounded-[14px] shadow-[0px_0px_10px_0px_rgba(77,77,79,0.1)] flex flex-col gap-[20px] p-[20px] flex-1 min-h-0">
          {/* Card header */}
          <div className="flex items-center gap-[10px] shrink-0">
            <span className="flex-1 text-[#434343] text-[22px]" style={{ fontFamily: SF, fontWeight: 700 }}>Trial 1</span>
            <div className="flex items-center gap-[8px]">
              <div className="size-[10px] rounded-full bg-[#a8a9aa]" />
              <span className="text-[#434343] text-[16px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 500 }}>PEF Predicted</span>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 min-h-0">
            <FlowVolumeChart showWaveform={showWaveform} />
          </div>

          {/* Trial dots */}
          <div className="flex justify-center gap-[8px] shrink-0">
            {Array.from({ length: dots }).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === trialDot ? 12 : 8,
                  height: i === trialDot ? 12 : 8,
                  backgroundColor: i === trialDot ? "#007a8b" : "#c5c5c7",
                }}
              />
            ))}
          </div>
        </div>

        {/* Coaching caption */}
        <p className="text-[#434343] text-[22px] text-center leading-[32px] shrink-0 pb-[4px]" style={{ fontFamily: SF, fontWeight: 700 }}>
          Exhale as quickly as possible until your lungs are empty, then take a deep Inhale until your lungs are completely full.
        </p>
      </div>

      {/* Dismissible instruction card */}
      {showCard && (
        <div className="absolute bottom-[24px] left-[30px] right-[30px] bg-white rounded-[14px] shadow-[0px_4px_20px_rgba(0,0,0,0.15)] p-[20px] flex items-start gap-[12px] z-10">
          <p className="flex-1 text-[#434343] text-[20px] leading-[28px]" style={{ fontFamily: SF, fontWeight: 400 }}>
            Inhale deeply first, then exhale forcefully to blast your air out, then inhale deeply a second time.
          </p>
          <button
            onClick={() => setShowCard(false)}
            className="shrink-0 size-[28px] flex items-center justify-center rounded-full bg-[#ececec] hover:bg-[#d9d9d9] transition-colors"
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#434343" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Screen 9: Test Completed modal ──────────────────────────────────────────
function TestCompletedModal({ onExit, onSeeResults }: { onExit: () => void; onSeeResults: () => void }) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
      <div className="bg-white rounded-[20px] shadow-2xl flex flex-col gap-[28px] p-[40px]" style={{ width: 560, maxWidth: "90vw" }}>
        <h2 className="text-[#434343] text-[28px] text-center" style={{ fontFamily: SF, fontWeight: 700 }}>
          Test Completed
        </h2>
        <p className="text-[#6e6f72] text-[20px] leading-[30px] text-center" style={{ fontFamily: SF, fontWeight: 400 }}>
          Excellent work! The assessment has been successfully completed. Please remove the mouthpiece and instruct the patient to breathe comfortably. Select 'See Results' to view the full assessment report.
        </p>
        <div className="flex items-center justify-center gap-[20px]">
          <button
            onClick={onExit}
            className="px-[28px] py-[16px] rounded-[10px] hover:bg-[#f5f5f5] transition-colors"
          >
            <span className="text-[#007a8b] text-[22px]" style={{ fontFamily: SF, fontWeight: 600 }}>Exit</span>
          </button>
          <button
            onClick={onSeeResults}
            className="bg-[#007a8b] px-[28px] py-[16px] rounded-[10px] hover:opacity-90 transition-opacity"
            style={{ minWidth: 200 }}
          >
            <span className="text-white text-[22px]" style={{ fontFamily: SF, fontWeight: 600 }}>See Results</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 10: Spirometry Results ───────────────────────────────────────────
function ResultsScreen({ onBack, onSelectAction }: { onBack: () => void; onSelectAction: () => void }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [evalSummary, setEvalSummary] = useState(true);

  const summaryText = `FVC: 2.45 L (79% predicted), FEV1: 1.89 L (72% predicted), FEV1/FVC ratio: 0.77 (94% predicted). These values were compared to GLI 2012 reference values for the patient's age, height, and ethnicity. The spirometry pattern is consistent with a suggested Normal lung disease pattern. Overall, findings are within acceptable clinical limits and no significant obstructive or restrictive defect was identified at this time.`;

  return (
    <div className="fixed inset-0 z-50 bg-[#fcfcfc] flex flex-col overflow-hidden">
      <PdBgDecoration />

      {/* Header */}
      <div className="relative z-10 px-[30px] pt-[14px] shrink-0">
        <div className="relative flex items-center h-[52px]">
          <button onClick={onBack} className="size-[30px] relative shrink-0" aria-label="Back">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgTestBackArrow} />
          </button>
          <Logo className="h-[48px] absolute left-1/2 -translate-x-1/2 w-[169.714px]" />
          {/* Patient header top-right */}
          <div className="absolute right-0 flex items-center gap-[10px]">
            <div className="flex flex-col gap-[4px] items-end text-right">
              <span className="text-[#212121] text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>Trish Willson</span>
              <span className="text-[#212121] text-[16px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 400 }}>Female</span>
            </div>
            <div className="border-2 border-dashed border-[#c5c5c7] flex items-center justify-center rounded-full size-[60px] overflow-hidden shrink-0">
              <img alt="Trish Willson" className="size-[50px] object-cover" src={imgFrame4773} />
            </div>
          </div>
        </div>

        <div className="mt-[10px]">
          <h1 className="text-[#212121] text-[34px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700 }}>
            Spirometry Results
          </h1>
          <div className="h-[8px] w-[60px] mt-[6px] relative">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle5} />
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-[30px] py-[20px] flex flex-col gap-[16px]">

        {/* Collapsible row */}
        <button
          className="bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] flex items-center justify-between px-[20px] py-[18px] rounded-[14px] w-full hover:opacity-90 transition-opacity"
          onClick={() => setDetailsOpen(v => !v)}
        >
          <span className="text-[#007a8b] text-[20px]" style={{ fontFamily: SF, fontWeight: 600 }}>
            Detailed Steps of PFT Interpretation
          </span>
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#007a8b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: detailsOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {detailsOpen && (
          <div className="bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] px-[20px] py-[16px] rounded-[14px] flex flex-col gap-[12px]">
            {["Step 1: Assess FVC", "Step 2: Assess FEV1", "Step 3: Assess FEV1/FVC ratio", "Step 4: Classify pattern", "Step 5: Compare to predicted"].map((step) => (
              <div key={step} className="flex items-center gap-[12px]">
                <div className="size-[8px] rounded-full bg-[#007a8b] shrink-0" />
                <span className="text-[#434343] text-[18px]" style={{ fontFamily: SF, fontWeight: 400 }}>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Spirometry Summary Notes card */}
        <div className="bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] flex flex-col gap-[20px] p-[20px] rounded-[14px]">
          <div className="flex items-center justify-between">
            <span className="text-[#434343] text-[24px]" style={{ fontFamily: SF, fontWeight: 700 }}>Spirometry Summary Notes</span>
          </div>

          {/* Quick-add chips */}
          <div className="flex gap-[12px] flex-wrap">
            {["+ Lung Sounds", "+ Vital Signs"].map((chip) => (
              <button
                key={chip}
                className="flex items-center gap-[6px] px-[16px] py-[8px] rounded-full border border-[#007a8b] hover:bg-[#f2f8f9] transition-colors"
              >
                <span className="text-[#007a8b] text-[18px]" style={{ fontFamily: SF, fontWeight: 600 }}>{chip}</span>
              </button>
            ))}
          </div>

          {/* Toggle: Eval Summary */}
          <div className="flex items-center gap-[14px]">
            <button
              onClick={() => setEvalSummary(v => !v)}
              className="relative shrink-0"
              style={{ width: 50, height: 28 }}
              aria-label="Toggle Eval Summary"
            >
              <div
                className="absolute inset-0 rounded-full transition-colors"
                style={{ backgroundColor: evalSummary ? "#007a8b" : "#c5c5c7" }}
              />
              <div
                className="absolute top-[3px] size-[22px] bg-white rounded-full shadow transition-transform"
                style={{ left: 3, transform: evalSummary ? "translateX(22px)" : "translateX(0)" }}
              />
            </button>
            <span className="text-[#434343] text-[20px]" style={{ fontFamily: SF, fontWeight: 500 }}>Eval Summary</span>
          </div>

          {/* Clinical summary paragraph */}
          {evalSummary && (
            <p className="text-[#434343] text-[20px] leading-[32px]" style={{ fontFamily: SF, fontWeight: 400 }}>
              {summaryText}
            </p>
          )}
        </div>
      </div>

      {/* Bottom: Select Action button */}
      <div className="bg-white drop-shadow-[0px_-6px_20px_rgba(77,77,79,0.1)] flex items-center justify-end px-[30px] py-[10px] h-[120px] shrink-0">
        <button
          onClick={onSelectAction}
          className="bg-[#007a8b] flex items-center justify-center px-[20px] py-[20px] rounded-[10px] w-[264px] hover:opacity-90 transition-opacity"
        >
          <span className="text-white text-[24px]" style={{ fontFamily: SF, fontWeight: 600 }}>Select Action</span>
        </button>
      </div>
    </div>
  );
}

// ─── Screen 11: Select Action ─────────────────────────────────────────────────
type ActionCard = { id: string; icon: React.ReactNode; title: string; subtitle: string; savedSubtitle?: string };

function SelectActionScreen({ onDone }: { onDone: () => void }) {
  const [saved, setSaved] = useState<string | null>(null);

  const actions: ActionCard[] = [
    {
      id: "save",
      title: "Save to ACPlus",
      subtitle: "Record will be saved to ACPlus",
      savedSubtitle: "Just now",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
        </svg>
      ),
    },
    {
      id: "email",
      title: "Email to HCP",
      subtitle: "Record will be sent to HCP",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      id: "next",
      title: "Next Assessment",
      subtitle: "Set next assessment date",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: "note",
      title: "Generate Progress Note",
      subtitle: "Automated Progress Note",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#fcfcfc] flex flex-col overflow-hidden">
      <PdBgDecoration />

      {/* Header */}
      <div className="relative z-10 px-[30px] pt-[14px] shrink-0">
        <div className="relative flex items-center h-[52px]">
          <Logo className="h-[48px] absolute left-1/2 -translate-x-1/2 w-[169.714px]" />
          {/* Patient header top-right */}
          <div className="absolute right-0 flex items-center gap-[10px]">
            <button onClick={onDone}>
              <span className="text-[#007a8b] text-[20px] mr-[16px]" style={{ fontFamily: SF, fontWeight: 600 }}>Done</span>
            </button>
            <div className="flex flex-col gap-[4px] items-end text-right">
              <span className="text-[#212121] text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>Trish Willson</span>
              <span className="text-[#212121] text-[16px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 400 }}>Female</span>
            </div>
            <div className="border-2 border-dashed border-[#c5c5c7] flex items-center justify-center rounded-full size-[60px] overflow-hidden shrink-0">
              <img alt="Trish Willson" className="size-[50px] object-cover" src={imgFrame4773} />
            </div>
          </div>
        </div>

        <div className="mt-[10px]">
          <h1 className="text-[#212121] text-[34px]" style={{ fontFamily: SF, fontWeight: 700 }}>Select Action</h1>
          <div className="h-[8px] w-[60px] mt-[6px] relative">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgRectangle5} />
          </div>
        </div>
      </div>

      {/* 2×2 grid */}
      <div className="flex-1 overflow-y-auto px-[30px] py-[24px]">
        <div className="grid grid-cols-2 gap-[20px]">
          {actions.map((action) => {
            const isSelected = saved === action.id;
            return (
              <button
                key={action.id}
                onClick={() => setSaved(action.id)}
                className="flex items-center gap-[16px] p-[24px] rounded-[14px] text-left transition-all hover:opacity-90"
                style={{
                  backgroundColor: isSelected ? "#007a8b" : "white",
                  boxShadow: "0px 0px 5px rgba(77,77,79,0.1)",
                }}
              >
                <div
                  className="shrink-0 size-[52px] flex items-center justify-center rounded-[12px]"
                  style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "#f2f8f9", color: isSelected ? "white" : "#007a8b" }}
                >
                  {action.icon}
                </div>
                <div className="flex flex-col gap-[6px] min-w-0">
                  <span
                    className="text-[22px] leading-tight"
                    style={{ fontFamily: SF, fontWeight: 700, color: isSelected ? "white" : "#434343" }}
                  >
                    {action.title}
                  </span>
                  <span
                    className="text-[18px] leading-snug"
                    style={{
                      fontFamily: SF,
                      fontWeight: 400,
                      color: isSelected ? "rgba(255,255,255,0.8)" : "#8b8c8e",
                    }}
                  >
                    {isSelected && action.savedSubtitle ? action.savedSubtitle : action.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Patient Demographics Screen ─────────────────────────────────────────────
type PdTab = "basic" | "vital" | "evaluation" | "positioning";

function PdFormField({ label, value, required, dropdown, calendar, disabled, unit }: {
  label: string; value?: string; required?: boolean; dropdown?: boolean;
  calendar?: boolean; disabled?: boolean; unit?: string;
}) {
  return (
    <div className="flex flex-col gap-[10px] flex-1 min-w-[280px]">
      {label && (
        <div className="flex gap-[2px] items-start">
          <span className="text-[#434343] text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>{label}</span>
          {required && <span className="text-[#e10e0e] text-[18px]" style={{ fontFamily: SF, fontWeight: 500 }}>*</span>}
        </div>
      )}
      <div className={`${disabled ? "bg-[#fcfcfc]" : "bg-white"} border-2 border-[#ececec] flex h-[80px] items-center px-[20px] rounded-[10px] w-full gap-[12px]`}>
        <span className={`flex-1 text-[20px] ${disabled ? "text-[#a8a9aa] text-center" : "text-[#6e6f72]"}`} style={{ fontFamily: SF, fontWeight: 400 }}>
          {value || ""}
        </span>
        {unit && <span className="text-[#434343] text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700 }}>{unit}</span>}
        {dropdown && (
          <div className="shrink-0 size-[24px] relative">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPdArrowTilt} />
          </div>
        )}
        {calendar && (
          <div className="shrink-0 size-[24px] relative">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPdCalendar} />
          </div>
        )}
      </div>
    </div>
  );
}

function PdRadio({ label, active, onClick }: { label: string; active: boolean; onClick?: () => void }) {
  return (
    <button className="flex gap-[6px] items-center" onClick={onClick}>
      <div className="relative shrink-0 size-[24px]">
        <img alt="" className="absolute block inset-0 max-w-none size-full" src={active ? imgPdRadioSelected : imgPdRadio} />
      </div>
      <span className={`text-[22px] whitespace-nowrap ${active ? "text-[#434343]" : "text-[#6e6f72]"}`} style={{ fontFamily: SF, fontWeight: 500 }}>
        {label}
      </span>
    </button>
  );
}

function PdBgDecoration() {
  return (
    <div className="absolute h-[310px] left-0 opacity-70 overflow-clip top-0 w-full pointer-events-none">
      <div className="absolute contents inset-[0_0_0_25.15%]">
        <div className="absolute contents inset-[-37.81%_-8.99%_3.94%_78.66%]">
          <div className="absolute contents inset-[-37.81%_-8.99%_3.94%_78.66%]" style={{ containerType: "size" }}>
            <div className="absolute contents inset-[14.34%_-8.99%_56.1%_95.44%]" style={{ containerType: "size" }}>
              <div className="absolute flex inset-[-13.35%_-12.1%_28.44%_92.34%] items-center justify-center" style={{ containerType: "size" }}>
                <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                  <div className="mask-position-[-917.853px_41.403px,_42.352px_85.856px] mask-size-[1022.503px_310px,_185.144px_91.641px] relative size-full" style={{ maskImage: `url("${imgGroup6}"), url("${imgGroup7}")` }}>
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup8} />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute contents inset-[36.25%_2.83%_3.94%_90.48%]" style={{ containerType: "size" }}>
              <div className="absolute flex inset-[22.55%_-3.45%_-9.73%_84.21%] items-center justify-center" style={{ containerType: "size" }}>
                <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                  <div className="mask-position-[-806.764px_-69.89px,_85.635px_42.493px] mask-size-[1022.503px_310px,_91.496px_185.391px] relative size-full" style={{ maskImage: `url("${imgGroup6}"), url("${imgGroup9}")` }}>
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup10} />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute contents inset-[14.34%_7.79%_56.1%_78.66%]" style={{ containerType: "size" }}>
              <div className="absolute flex inset-[-15.04%_4.5%_26.72%_75.36%] items-center justify-center" style={{ containerType: "size" }}>
                <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                  <div className="mask-position-[-685.979px_46.622px,_44.974px_91.076px] mask-size-[1022.503px_310px,_185.126px_91.641px] relative size-full" style={{ maskImage: `url("${imgGroup6}"), url("${imgGroup11}")` }}>
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup12} />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute contents inset-[-37.81%_2.83%_78.01%_90.48%]" style={{ containerType: "size" }}>
              <div className="absolute flex inset-[-52.33%_-3.83%_63.48%_83.82%] items-center justify-center" style={{ containerType: "size" }}>
                <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                  <div className="mask-position-[-801.428px_162.237px,_90.971px_45.01px] mask-size-[1022.503px_310px,_91.496px_185.405px] relative size-full" style={{ maskImage: `url("${imgGroup6}"), url("${imgGroup13}")` }}>
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientDemographicsScreen({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
  const [tab, setTab] = useState<PdTab>("basic");
  const [evalRadio, setEvalRadio] = useState<string>("Treatment Encounter");
  const [orientedTo, setOrientedTo] = useState<string[]>(["Place"]);
  const [mentalStatus, setMentalStatus] = useState("Comatose");
  const [lungSounds, setLungSounds] = useState<Record<string, string>>({
    "Right Upper Lobe - Anterior": "Rales (Crackles)",
    "Right Upper Lobe - Posterior": "Rales (Crackles)",
    "Right Lower Lobe - Anterior": "",
    "Left Lower Lobe - Posterior": "Rales (Crackles)",
    "Left Upper Lobe - Anterior": "",
    "Left Upper Lobe - Posterior": "Rales (Crackles)",
    "Left Lower Lobe - Anterior": "Clear",
    "Right Lower Lobe - Posterior": "Rales (Crackles)",
  });
  const [respChar, setRespChar] = useState<string[]>([]);
  const [coughPresent, setCoughPresent] = useState("Yes");
  const [coughType, setCoughType] = useState("Non-Productive");
  const [coughEff, setCoughEff] = useState("Effective");
  const [sputumAmount, setSputumAmount] = useState("");
  const [sputumColor, setSputumColor] = useState("");
  const [sputumConsistency, setSputumConsistency] = useState("Thick");
  const [recServices, setRecServices] = useState<string[]>(["Incentive Spirometry"]);
  const [discServices, setDiscServices] = useState<string[]>(["Incentive Spirometry"]);
  const [isDiscontinuing, setIsDiscontinuing] = useState("No");

  function toggleArr(arr: string[], setArr: (v: string[]) => void, val: string) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  }

  const tabs: { key: PdTab; label: string }[] = [
    { key: "basic", label: "Basic Info" },
    { key: "vital", label: "Vital Signs From EMR" },
    { key: "evaluation", label: "Evaluation" },
    { key: "positioning", label: "Positioning & Previous Assessments" },
  ];

  const noteText = (
    <div className="flex flex-col gap-[10px] text-[#6e6f72] mt-[4px]">
      <p className="text-[16px] leading-[24px] italic" style={{ fontFamily: "Roboto, sans-serif", fontWeight: 400 }}>
        Note: Red asterisk fields above have adopted the terminology and data sets directly from the Global Lung Initiative.
      </p>
      <p className="text-[16px] leading-[29px] italic" style={{ fontFamily: "Roboto, sans-serif", fontWeight: 400 }}>
        {`Quanjer, P. H., Stanojevic, S., Cole, T. J, Baur, X. , Hall, G. L. , Culver, B. H., Enright, P. L. , Hankinson, J. L. , Ip, M. S., Zheng, J. , Stocks, J. , & ERS Global Lung Function Initiative, (2012), `}
      </p>
      <p className="text-[16px] leading-[29px] italic" style={{ fontFamily: "Roboto, sans-serif", fontWeight: 400 }}>
        {`Multi-ethnic Reference Values for Spirometry for the 3—95-yr Age Range: The Global Lung Function 2012 Equations. The European Respiratory Journal, 40(6), 1324-1343.`}
      </p>
      <a className="text-[16px] leading-[29px] italic text-[#007a8b] underline block" href="https://doi.org/10.1183/09031936.00080312" target="_blank" rel="noreferrer" style={{ fontFamily: "Roboto, sans-serif", fontWeight: 400 }}>
        https://doi.org/10.1183/09031936.00080312
      </a>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#fcfcfc] flex flex-col overflow-hidden">
      <PdBgDecoration />

      {/* Header */}
      <div className="relative z-10 px-[30px] pt-[14px] shrink-0">
        <div className="relative flex items-center h-[52px]">
          <button onClick={onBack} className="size-[30px] relative shrink-0" aria-label="Back">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPdBackArrow} />
          </button>
          <Logo className="h-[48px] absolute left-1/2 -translate-x-1/2 w-[169.714px]" />
        </div>

        {/* Title row + Patient info */}
        <div className="flex items-start justify-between mt-[10px] gap-[18px]">
          <div className="flex flex-col gap-[18px] justify-end flex-1 min-w-0">
            <div>
              <h1 className="text-[#212121] text-[34px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700 }}>
                Patient Demographics
              </h1>
            </div>
            <div className="h-[8px] w-[60px] relative">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPdRectangle5} />
            </div>
          </div>
          {/* Patient avatar card */}
          <div className="flex gap-[10px] items-center shrink-0">
            <div className="flex flex-col gap-[4px] items-end text-right">
              <span className="text-[#212121] text-[24px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>Trish Willson</span>
              <span className="text-[#212121] text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 400 }}>Female</span>
            </div>
            <div className="border-2 border-dashed border-[#c5c5c7] flex items-center justify-center rounded-full size-[80px] overflow-hidden shrink-0">
              <img alt="Trish Willson" className="size-[66px] object-cover" src={imgFrame4773} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="relative z-10 flex gap-[30px] px-[30px] py-[10px] border-b-[1.5px] border-[#ececec] shrink-0 mt-[10px]">
        {tabs.map(({ key, label }) => {
          const active = tab === key;
          return (
            <button key={key} className="flex flex-col gap-[14px] items-start" onClick={() => setTab(key)}>
              <span className="text-[22px] whitespace-nowrap" style={{
                fontFamily: SF,
                fontWeight: active ? 700 : 500,
                color: active ? "#007a8b" : "#8b8c8e",
              }}>{label}</span>
              {active && <div className="h-[3px] w-full bg-[#007a8b] rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-[30px] py-[20px] flex flex-col gap-[20px]">
        {/* TAB 1: Basic Info */}
        {tab === "basic" && (
          <>
            <div className="bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] flex flex-col gap-[24px] p-[20px] rounded-[14px]">
              <span className="text-[#434343] text-[24px]" style={{ fontFamily: SF, fontWeight: 700 }}>Patient Details</span>
              <div className="flex flex-wrap gap-[24px]">
                <PdFormField label="Patient Name" value="Trish Willson" required />
                <PdFormField label="Gender" value="Female" required dropdown />
                <PdFormField label="Date of Birth" value="01/10/1964" required calendar />
                <PdFormField label="Age (years)" value="61.6" disabled />
                <PdFormField label="Weight (lbs)" value="200.0" required />
                <div className="flex gap-[20px] items-end flex-1 min-w-[500px]">
                  <PdFormField label="Height (ft)" value="4'" required dropdown />
                  <PdFormField label="" value="6&quot;" dropdown />
                  <PdFormField label="Height(cm)" value="137.02" />
                </div>
                <PdFormField label="Ethnicity" value="African American" required dropdown />
              </div>
            </div>
            {noteText}
          </>
        )}

        {/* TAB 2: Vital Signs From EMR (same patient details form) */}
        {tab === "vital" && (
          <>
            <div className="bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] flex flex-col gap-[24px] p-[20px] rounded-[14px]">
              <span className="text-[#434343] text-[24px]" style={{ fontFamily: SF, fontWeight: 700 }}>Patient Details</span>
              <div className="flex flex-wrap gap-[24px]">
                <PdFormField label="Patient Name" value="Trish Willson" required />
                <PdFormField label="Gender" value="Female" required dropdown />
                <PdFormField label="Date of Birth" value="01/10/1964" required calendar />
                <PdFormField label="Age (years)" value="61.6" disabled />
                <PdFormField label="Weight (lbs)" value="200.0" required />
                <div className="flex gap-[20px] items-end flex-1 min-w-[500px]">
                  <PdFormField label="Height (ft)" value="4'" required dropdown />
                  <PdFormField label="" value="6&quot;" dropdown />
                  <PdFormField label="Height(cm)" value="137.02" />
                </div>
                <PdFormField label="Ethnicity" value="African American" required dropdown />
              </div>
            </div>
            {noteText}
          </>
        )}

        {/* TAB 3: Evaluation */}
        {tab === "evaluation" && (() => {
          const SectionCard = ({ children }: { children: React.ReactNode }) => (
            <div className="bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] flex flex-col gap-[20px] p-[20px] rounded-[14px]">
              {children}
            </div>
          );
          const SectionTitle = ({ children }: { children: React.ReactNode }) => (
            <span className="text-[#434343] text-[24px]" style={{ fontFamily: SF, fontWeight: 700 }}>{children}</span>
          );
          const SubLabel = ({ children }: { children: React.ReactNode }) => (
            <span className="text-[#434343] text-[20px]" style={{ fontFamily: SF, fontWeight: 500 }}>{children}</span>
          );
          const Divider = () => (
            <div className="h-px w-full bg-[#ececec] shrink-0" />
          );
          const Textarea = ({ placeholder = "Please specify" }: { placeholder?: string }) => (
            <div className="bg-white border-2 border-[#ececec] flex h-[80px] items-start px-[20px] py-[16px] rounded-[10px] w-full">
              <span className="text-[#8b8c8e] text-[20px]" style={{ fontFamily: SF, fontWeight: 400 }}>{placeholder}</span>
            </div>
          );
          const RadioRow = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
            <div className="flex flex-wrap gap-[20px]">
              {options.map(opt => (
                <PdRadio key={opt} label={opt} active={value === opt} onClick={() => onChange(opt)} />
              ))}
            </div>
          );
          const CheckRow = ({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) => (
            <div className="flex flex-wrap gap-[20px]">
              {options.map(opt => (
                <PdRadio key={opt} label={opt} active={value.includes(opt)} onClick={() => toggleArr(value, onChange, opt)} />
              ))}
            </div>
          );
          const lungLobes = [
            "Right Upper Lobe - Anterior",
            "Right Upper Lobe - Posterior",
            "Right Lower Lobe - Anterior",
            "Left Lower Lobe - Posterior",
            "Left Upper Lobe - Anterior",
            "Left Upper Lobe - Posterior",
            "Left Lower Lobe - Anterior",
            "Right Lower Lobe - Posterior",
          ];
          const lungOpts = ["Clear", "Rales (Crackles)", "Rhonchi", "Wheeze", "Diminished", "Other"];
          return (
            <>
              {/* Evaluation */}
              <SectionCard>
                <SectionTitle>Evaluation</SectionTitle>
                <RadioRow
                  options={["Initial Evaluation", "Treatment Encounter", "Discharge / Last Day of treatment"]}
                  value={evalRadio}
                  onChange={setEvalRadio}
                />
                <Textarea />
              </SectionCard>

              {/* Vital Signs */}
              <SectionCard>
                <SectionTitle>Vital Signs</SectionTitle>
                <div className="flex flex-col gap-[16px]">
                  <SubLabel>Most Recent Temperature</SubLabel>
                  <div className="flex flex-wrap gap-[16px]">
                    <PdFormField label="" value="Temperature" unit="°F" />
                    <PdFormField label="" value="Route" dropdown />
                    <PdFormField label="" value="Date" dropdown />
                  </div>
                </div>
                <Divider />
                <div className="flex flex-col gap-[16px]">
                  <SubLabel>Most Recent Pulse</SubLabel>
                  <div className="grid grid-cols-2 gap-[16px]">
                    <PdFormField label="" value="Pulse" unit="BPM" />
                    <PdFormField label="" value="Pulse Type" dropdown />
                    <PdFormField label="" value="Date" dropdown />
                  </div>
                </div>
                <Divider />
                <div className="flex flex-col gap-[16px]">
                  <SubLabel>Most Recent Respiration</SubLabel>
                  <div className="grid grid-cols-2 gap-[16px]">
                    <PdFormField label="" value="Respiration (Resp/min)" dropdown />
                    <PdFormField label="" value="Date" dropdown />
                  </div>
                </div>
                <Divider />
                <div className="flex flex-col gap-[16px]">
                  <SubLabel>Most Recent Blood Pressure</SubLabel>
                  <div className="grid grid-cols-2 gap-[16px]">
                    <div className="bg-white border-2 border-[#ececec] flex h-[80px] items-center px-[20px] rounded-[10px] gap-[12px]">
                      <span className="flex-1 text-[20px] text-[#8b8c8e]" style={{ fontFamily: SF }}>Blood Pressure</span>
                      <span className="text-[#ccc] text-[20px]" style={{ fontFamily: SF, fontWeight: 700 }}>120/80</span>
                    </div>
                    <PdFormField label="" value="Position" dropdown />
                    <PdFormField label="" value="Date" dropdown />
                  </div>
                </div>
                <Divider />
                <div className="flex flex-col gap-[16px]">
                  <SubLabel>Most Recent O₂ sats</SubLabel>
                  <div className="grid grid-cols-2 gap-[16px]">
                    <PdFormField label="" value="O₂ sats" unit="%" />
                    <PdFormField label="" value="Method" dropdown />
                    <PdFormField label="" value="Date" dropdown />
                  </div>
                </div>
              </SectionCard>

              {/* Orientation */}
              <SectionCard>
                <SectionTitle>Orientation</SectionTitle>
                <div className="flex flex-col gap-[10px]">
                  <SubLabel>Oriented to: (Check all that apply)</SubLabel>
                  <CheckRow
                    options={["Time", "Place", "Person", "Situation", "Unable to determine"]}
                    value={orientedTo}
                    onChange={setOrientedTo}
                  />
                </div>
              </SectionCard>

              {/* Mental Status */}
              <SectionCard>
                <SectionTitle>Mental Status</SectionTitle>
                <div className="flex flex-col gap-[10px]">
                  <SubLabel>Mental Status</SubLabel>
                  <RadioRow
                    options={["Resting with Eyes Closed", "Comatose", "Awake and Responsive", "Awake and Confused", "Other"]}
                    value={mentalStatus}
                    onChange={setMentalStatus}
                  />
                </div>
                <Textarea />
              </SectionCard>

              {/* Lungs Sounds */}
              <SectionCard>
                <SectionTitle>Lungs Sounds</SectionTitle>
                {lungLobes.map((lobe, i) => (
                  <div key={lobe} className="flex flex-col gap-[12px]">
                    {i > 0 && <Divider />}
                    <SubLabel>{lobe}</SubLabel>
                    <RadioRow
                      options={lungOpts}
                      value={lungSounds[lobe] || ""}
                      onChange={v => setLungSounds(prev => ({ ...prev, [lobe]: v }))}
                    />
                    <Textarea />
                  </div>
                ))}
              </SectionCard>

              {/* Respiratory Character */}
              <SectionCard>
                <SectionTitle>Respiratory Character and Signs and Symptoms of Respiratory Distress</SectionTitle>
                <CheckRow
                  options={["Regular", "Shallow", "SOB - while lying flat", "SOB upon exertion", "SOB while sitting", "Tachypnea", "Dyspnea"]}
                  value={respChar}
                  onChange={setRespChar}
                />
                <CheckRow
                  options={["Grunting / Noisy Respirations", "Cyanosis", "Diaphoresis", "Anxious / Restlessness", "Flared Nostrils", "Other"]}
                  value={respChar}
                  onChange={setRespChar}
                />
                <Textarea />
              </SectionCard>

              {/* Cough */}
              <SectionCard>
                <SectionTitle>Cough</SectionTitle>
                <div className="flex flex-col gap-[10px]">
                  <SubLabel>Does Resident have cough?</SubLabel>
                  <RadioRow options={["Yes", "No"]} value={coughPresent} onChange={setCoughPresent} />
                </div>
                <Divider />
                <div className="flex flex-col gap-[10px]">
                  <SubLabel>What type of cough is this?</SubLabel>
                  <RadioRow options={["Productive", "Non-Productive"]} value={coughType} onChange={setCoughType} />
                </div>
                <Divider />
                <div className="flex flex-col gap-[10px]">
                  <SubLabel>Is it?</SubLabel>
                  <RadioRow options={["Effective", "Ineffective"]} value={coughEff} onChange={setCoughEff} />
                </div>
                <Divider />
                <div className="flex flex-col gap-[10px]">
                  <SubLabel>Sputum Amount</SubLabel>
                  <RadioRow options={["None", "Small", "Moderate", "Copious"]} value={sputumAmount} onChange={setSputumAmount} />
                </div>
                <Divider />
                <div className="flex flex-col gap-[10px]">
                  <SubLabel>Sputum Color</SubLabel>
                  <RadioRow options={["None", "White", "Tan", "Brown", "Green", "Yellow", "Blood Tinged", "Bloody"]} value={sputumColor} onChange={setSputumColor} />
                </div>
                <Divider />
                <div className="flex flex-col gap-[10px]">
                  <SubLabel>Sputum Consistency</SubLabel>
                  <RadioRow options={["Thin", "Thick", "Frothy"]} value={sputumConsistency} onChange={setSputumConsistency} />
                </div>
              </SectionCard>

              {/* Recommendations */}
              <SectionCard>
                <SectionTitle>Recommendations for Nursing Respiratory Services</SectionTitle>
                <div className="flex flex-col gap-[10px]">
                  <SubLabel>Recommended Respiratory Services</SubLabel>
                  <CheckRow
                    options={["Turn, Cough and Deep Breathing Exercises", "Incentive Spirometry", "Flutter Valve Device", "Pulmonary Percussion", "Other"]}
                    value={recServices}
                    onChange={setRecServices}
                  />
                </div>
                <Textarea />
              </SectionCard>

              {/* Current Status */}
              <SectionCard>
                <SectionTitle>Current Status</SectionTitle>
                <div className="flex flex-col gap-[10px]">
                  <SubLabel>Respiratory Services Being Discontinued</SubLabel>
                  <CheckRow
                    options={["Turn, Cough and Deep Breathing Exercises", "Incentive Spirometry", "Flutter Valve Device", "Pulmonary Percussion"]}
                    value={discServices}
                    onChange={setDiscServices}
                  />
                </div>
                <Textarea placeholder="Includes description of when (if any) all services will be required to be discontinued" />
                <Divider />
                <div className="flex flex-col gap-[10px]">
                  <SubLabel>Are Nursing Respiratory Services Being Discontinued?</SubLabel>
                  <RadioRow options={["Yes", "No"]} value={isDiscontinuing} onChange={setIsDiscontinuing} />
                </div>
              </SectionCard>

              {/* Note */}
              {noteText}
            </>
          );
        })()}

        {/* TAB 4: Positioning & Previous Assessments */}
        {tab === "positioning" && (
          <>
            <div className="bg-white drop-shadow-[0px_0px_5px_rgba(77,77,79,0.1)] flex flex-col gap-[24px] p-[20px] rounded-[14px]">
              <div className="flex items-center gap-[24px]">
                <span className="text-[#434343] text-[24px] flex-1 min-w-0" style={{ fontFamily: SF, fontWeight: 700 }}>
                  Positioning &amp; Previous Assessments
                </span>
                <button className="flex items-center gap-[4px] shrink-0">
                  <div className="relative shrink-0 size-[24px]">
                    <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgPdEye} />
                  </div>
                  <span className="text-[#007a8b] text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 600 }}>
                    View previous docs
                  </span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-[24px]">
                <PdFormField label="Patient Position" value="Wheelchair" dropdown />
                <PdFormField label="Angle of Inclination" value="Angle of Inclination" dropdown />
                <PdFormField label="Patient Posture" value="Patient Posture" dropdown />
                <PdFormField label="Last Meal" value="Last meal" dropdown />
                <PdFormField label="Time of last meal" value="03:42 AM" dropdown />
              </div>
            </div>
            {noteText}
          </>
        )}
      </div>

      {/* Save button bar */}
      <div className="bg-white drop-shadow-[0px_-6px_20px_rgba(77,77,79,0.1)] flex items-center justify-end px-[30px] py-[10px] h-[120px] shrink-0">
        <button onClick={onSave} className="bg-[#007a8b] flex items-center justify-center px-[20px] py-[20px] rounded-[10px] w-[264px] hover:opacity-90 transition-opacity">
          <span className="text-white text-[24px]" style={{ fontFamily: SF, fontWeight: 600 }}>Save</span>
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [askOpen, setAskOpen] = useState(false);
  const [qcOpen, setQcOpen] = useState(false);
  const [spiroOpen, setSpiroOpen] = useState(false);
  const [pftOpen, setPftOpen] = useState(false);
  const [patientDemoOpen, setPatientDemoOpen] = useState(false);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [testCompletedOpen, setTestCompletedOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [selectActionOpen, setSelectActionOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [chatSlideOut, setChatSlideOut] = useState(false);
  const [guidePatientName, setGuidePatientName] = useState<string | undefined>();
  const [guideDeviceSerial, setGuideDeviceSerial] = useState<string | undefined>();
  const [guideTestType, setGuideTestType] = useState<string | undefined>();
  const [testFromGuide, setTestFromGuide] = useState(false);
  const [guideStep, setGuideStep] = useState<GuideStepState<SpirometryContext> | null>(null);
  const [askVoice, setAskVoice] = useState<string | null>(null);
  const guideRef = useRef<GuidedFlowHandle>(null);

  function closeAsk() {
    setAskOpen(false);
    setAskVoice(null);
  }

  // Quick-replies from the chat drive the paused guide once the panel is gone
  function handleGuideChip(chip: ReplyChip) {
    closeAsk();
    if (chip.action.type === "command") {
      const command = chip.action.command;
      setTimeout(() => guideRef.current?.sendCommand(command), 60);
    }
  }

  const handleVoiceSend = useCallback((transcript: string) => {
    setAskVoice(transcript);
    setAskOpen(true);
  }, []);

  const guideChatLabel = guideStep
    ? `${guideStep.stepLabel}${guideStep.context.patient ? ` · ${guideStep.context.patient.name}` : ""}`
    : "";

  function handleStartGuide() {
    setChatSlideOut(true);
    setTimeout(() => {
      setAskOpen(false);
      setChatSlideOut(false);
      setGuideOpen(true);
    }, 260);
  }

  function handleGuideStart({ patient, device, test }: SpirometryContext) {
    setGuidePatientName(patient?.name);
    setGuideDeviceSerial(device?.serial);
    setGuideTestType(test?.label);
    setGuideOpen(false);
    setGuideStep(null);
    setTestFromGuide(true);
    setTestOpen(true);
  }

  return (
    <div className="bg-[#fcfcfc] h-screen w-full relative overflow-hidden flex flex-col">
      {/* Background decorative blobs */}
      <div className="absolute h-[310px] left-0 opacity-70 overflow-clip top-0 w-full pointer-events-none">
        <div className="absolute contents inset-[0_0_0_25.15%]">
          <div className="absolute contents inset-[-37.81%_-8.99%_3.94%_78.66%]">
            <div className="absolute contents inset-[-37.81%_-8.99%_3.94%_78.66%]" style={{ containerType: "size" }}>
              <div className="absolute contents inset-[14.34%_-8.99%_56.1%_95.44%]" style={{ containerType: "size" }}>
                <div className="absolute flex inset-[-13.35%_-12.1%_28.44%_92.34%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                    <div className="mask-position-[-917.853px_41.403px,_42.352px_85.856px] mask-size-[1022.503px_310px,_185.144px_91.641px] relative size-full" style={{ maskImage: `url("${imgGroup6}"), url("${imgGroup7}")` }}>
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup8} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute contents inset-[36.25%_2.83%_3.94%_90.48%]" style={{ containerType: "size" }}>
                <div className="absolute flex inset-[22.55%_-3.45%_-9.73%_84.21%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                    <div className="mask-position-[-806.764px_-69.89px,_85.635px_42.493px] mask-size-[1022.503px_310px,_91.496px_185.391px] relative size-full" style={{ maskImage: `url("${imgGroup6}"), url("${imgGroup9}")` }}>
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup10} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute contents inset-[14.34%_7.79%_56.1%_78.66%]" style={{ containerType: "size" }}>
                <div className="absolute flex inset-[-15.04%_4.5%_26.72%_75.36%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                    <div className="mask-position-[-685.979px_46.622px,_44.974px_91.076px] mask-size-[1022.503px_310px,_185.126px_91.641px] relative size-full" style={{ maskImage: `url("${imgGroup6}"), url("${imgGroup11}")` }}>
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup12} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute contents inset-[-37.81%_2.83%_78.01%_90.48%]" style={{ containerType: "size" }}>
                <div className="absolute flex inset-[-52.33%_-3.83%_63.48%_83.82%] items-center justify-center" style={{ containerType: "size" }}>
                  <div className="-rotate-90 flex-none h-[100cqw] w-[100cqh]">
                    <div className="mask-position-[-801.428px_162.237px,_90.971px_45.01px] mask-size-[1022.503px_310px,_91.496px_185.405px] relative size-full" style={{ maskImage: `url("${imgGroup6}"), url("${imgGroup13}")` }}>
                      <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgGroup14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex flex-col flex-1 min-h-0">

        {/* Top Navigation */}
        <header className="relative flex items-center justify-between h-[68px] shrink-0" style={{ paddingTop: 16, paddingRight: 24, paddingBottom: 16, paddingLeft: 24 }}>
          <button className="relative flex-shrink-0" style={{ width: 36, height: 36 }} aria-label="Menu">
            <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgMenu} />
          </button>

          <Logo className="h-[48px] absolute left-1/2 -translate-x-1/2 w-[169.714px]" />

          <div className="flex gap-[18px] items-center">
            {/* Quick connect — circle with icon */}
            <button className="relative shrink-0 size-[42px]" aria-label="Quick connect" onClick={() => setQcOpen(true)}>
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgEllipse7} />
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="absolute" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
                <path d="M9 2V16M2 9H16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="relative shrink-0 size-[26px]" aria-label="Link patient">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgLinkPatient2} />
            </button>
            <button className="relative shrink-0 size-[26px]" aria-label="Chat" onClick={() => setAskOpen(true)}>
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgChat} />
            </button>
            <button className="relative shrink-0 size-[26px]" aria-label="Search">
              <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgSearch} />
            </button>
          </div>
        </header>

        {/* Dashboard heading + Add Patient */}
        <div className="px-[30px] pt-1 pb-3 shrink-0 flex items-start justify-between">
          <div>
            <h1 className="text-[#434343] text-[32px] leading-normal" style={{ fontFamily: SF, fontWeight: 700 }}>
              Dashboard
            </h1>
            <div className="h-[7px] w-[56px] mt-1">
              <img alt="" className="block w-full h-full" src={imgRectangle5} />
            </div>
          </div>
          <button
            className="flex items-center gap-2 text-white text-[16px] pl-[12px] pr-[12px] mt-1 hover:opacity-90 transition-opacity"
            style={{ paddingTop: 12, paddingBottom: 12, paddingLeft: 12, paddingRight: 12, background: "#007A8B", borderRadius: 10, fontFamily: SF, fontWeight: 600 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
            </svg>
            Add Patient
          </button>
        </div>

        {/* Recently Viewed */}
        <section className="px-[30px] mb-4 shrink-0">
          <h2 className="text-[#434343] text-[20px] mb-3" style={{ fontFamily: SF, fontWeight: 700 }}>
            Recently Viewed
          </h2>
          <div className="bg-white drop-shadow-[0px_3px_5px_rgba(77,77,79,0.07)] flex items-center px-5 py-4 rounded-2xl overflow-x-auto" style={{ gap: "16px 38px", rowGap: 16, columnGap: 38 }}>
            {recentlyViewed.map((u, i) => (
              <button key={i} className="flex flex-col items-center gap-2 shrink-0 hover:opacity-80 transition-opacity w-[130px]">
                <div className="border-2 border-dashed border-[#c5c5c7] flex items-center justify-center rounded-full size-[72px] overflow-hidden">
                  {u.avatar ? (
                    <img alt={u.name} className="size-full object-cover rounded-full" src={u.avatar} />
                  ) : (
                    <InitialAvatar initials={u.initials!} size={60} textSize={22} />
                  )}
                </div>
                <p className="text-[#6e6f72] text-[14px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 500 }}>{u.name}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Patients section */}
        <section className="flex flex-col flex-1 px-[30px] min-h-0">
          {/* Tabs + Filter */}
          <div className="flex items-center justify-between h-[44px] mb-4 shrink-0">
            <div className="flex gap-5 items-start">
              <button className="flex flex-col gap-3 items-start" onClick={() => setActiveTab("all")}>
                <p className="text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: 700, color: activeTab === "all" ? "#007a8b" : "#8b8c8e" }}>
                  All Patients (11)
                </p>
                {activeTab === "all" && <div className="bg-[#007a8b] h-[3px] rounded-full w-[56px]" />}
              </button>
              <button className="flex flex-col gap-3 items-start" onClick={() => setActiveTab("my")}>
                <p className="text-[20px] whitespace-nowrap" style={{ fontFamily: SF, fontWeight: activeTab === "my" ? 700 : 600, color: activeTab === "my" ? "#007a8b" : "#8b8c8e" }}>
                  My Patients
                </p>
                {activeTab === "my" && <div className="bg-[#007a8b] h-[3px] rounded-full w-[56px]" />}
              </button>
            </div>
            <button className="flex gap-2 items-center hover:opacity-80 transition-opacity">
              <img alt="" className="size-[22px]" src={imgSetting} />
              <p className="text-[#007a8b] text-[17px]" style={{ fontFamily: SF, fontWeight: 700 }}>Sort &amp; Filter</p>
            </button>
          </div>

          {/* Patient list — scrollable only */}
          <div className="flex flex-col gap-3 overflow-y-auto flex-1 pb-6">
            {allPatients.map((p, i) => (
              <PatientRow key={i} {...p} className="!pt-[12px] !pr-[16px] !pb-[12px] !pl-[16px]" />
            ))}
          </div>
        </section>
      </div>

      {/* Ask button — stays above the guide overlay so the assistant is always reachable */}
      <div className="fixed transition-[opacity,visibility] duration-200" style={{ right: 36, bottom: 24, width: 155, height: 66, zIndex: guideOpen ? 70 : 40, opacity: guideOpen && askOpen ? 0 : 1, visibility: guideOpen && askOpen ? "hidden" : "visible" }}>
        <div aria-hidden="true" className="absolute" style={{ left: 20, top: 31, width: 114, height: 35, borderRadius: 22, filter: "blur(11.7px)", backgroundImage: "linear-gradient(162.9deg, #007A8B 0%, #3AAF4D 37%, #A8CB38 85.6%)" }} />
        <button
          className="absolute flex items-center hover:opacity-90 transition-opacity"
          style={{ left: 5, bottom: 2, width: 146, height: 64, borderRadius: 50, backgroundImage: "linear-gradient(156.3deg, #007A8B 0%, #3AAF4D 37%, #A8CB38 85.6%)", pointerEvents: askOpen ? "none" : undefined }}
          aria-disabled={askOpen || undefined}
          tabIndex={askOpen ? -1 : undefined}
          aria-label="Ask the assistant"
          onClick={() => setAskOpen(true)}
        >
          <img alt="" className="absolute" style={{ left: 25, top: 14, width: 36, height: 36 }} src={imgIcon} />
          <span className="absolute text-white text-[24px] font-medium" style={{ left: 67, top: 17, lineHeight: "29px", fontFamily: SF }}>Ask!</span>
        </button>
      </div>

      {/* GuidedFlow wizard */}
      {guideOpen && (
        <GuidedFlow
          ref={guideRef}
          flow={spirometryFlow}
          onClose={() => { setGuideOpen(false); setGuideStep(null); }}
          onStart={handleGuideStart}
          paused={askOpen}
          onStepChange={setGuideStep}
          voice={{
            scriptFor: scriptedTranscript,
            onSend: handleVoiceSend,
            // Beside Ask! (pill spans 36+4 … 36+150 from the right edge, 26px up): 16px gap, same centre line
            anchor: { right: 36 + 150 + 16, bottom: 24 + 2 },
          }}
        />
      )}

      {/* Ask panel */}
      {askOpen && (
        <AskPanel
          onClose={closeAsk}
          onStartGuide={handleStartGuide}
          slideOut={chatSlideOut}
          guide={guideOpen && guideStep ? {
            label: guideChatLabel,
            reply: text => resolveReply(guideStep.stepId, text),
            onChip: handleGuideChip,
            voiceMessage: askVoice ?? undefined,
          } : undefined}
        />
      )}

      {/* Quick Connect screen */}
      {qcOpen && <QuickConnectScreen onClose={() => setQcOpen(false)} onOpenAsk={() => setAskOpen(true)} onOpenSpiro={() => setSpiroOpen(true)} />}

      {/* Spirometer screen */}
      {spiroOpen && <SpiorometerScreen onBack={() => setSpiroOpen(false)} onConnect={() => { setPftOpen(true); setSpiroOpen(false); }} />}

      {/* Pulmonary Function Test screen */}
      {pftOpen && <PulmonaryFunctionScreen onBack={() => { setPftOpen(false); setSpiroOpen(true); }} onOpenPatientDemo={() => { setPftOpen(false); setPatientDemoOpen(true); }} />}

      {/* Patient Demographics screen */}
      {patientDemoOpen && <PatientDemographicsScreen onBack={() => { setPatientDemoOpen(false); setPftOpen(true); }} onSave={() => { setPatientDemoOpen(false); setInstructionsOpen(true); }} />}

      {instructionsOpen && <InstructionsScreen onBack={() => { setInstructionsOpen(false); setPatientDemoOpen(true); }} onStartTest={() => { setInstructionsOpen(false); setTestOpen(true); }} onWarmUp={() => { setInstructionsOpen(false); setTestOpen(true); }} />}

      {testOpen && <TestExecutionScreen onBack={() => { setTestOpen(false); if (testFromGuide) setTestFromGuide(false); else setInstructionsOpen(true); }} onEndTest={() => { setTestOpen(false); setTestFromGuide(false); setTestCompletedOpen(true); }} patientName={guidePatientName} deviceSerial={guideDeviceSerial} testType={guideTestType} />}
      {testCompletedOpen && <TestCompletedModal onExit={() => setTestCompletedOpen(false)} onSeeResults={() => { setTestCompletedOpen(false); setResultsOpen(true); }} />}
      {resultsOpen && <ResultsScreen onBack={() => { setResultsOpen(false); setTestCompletedOpen(true); }} onSelectAction={() => { setResultsOpen(false); setSelectActionOpen(true); }} />}
      {selectActionOpen && <SelectActionScreen onDone={() => setSelectActionOpen(false)} />}
    </div>
  );
}
