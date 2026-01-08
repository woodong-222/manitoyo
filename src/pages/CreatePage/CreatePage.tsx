import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../../components/FormField";
import { createRoom } from "../../lib/firestore";
import kakaoLogo from "../../assets/kakaotalk.png";
import "./CreatePage.css";

function CreatePage() {
  const [title, setTitle] = useState("");
  const [masterPassword, setMasterPassword] = useState("");
  const [participants, setParticipants] = useState("");
  const [roomId, setRoomId] = useState("");
  const [entryLink, setEntryLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [messageCopied, setMessageCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMinCountModalOpen, setIsMinCountModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateNames, setDuplicateNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async () => {
    setRoomId("");
    setEntryLink("");
    setMessageCopied(false);
    setIsModalOpen(false);
    setIsMinCountModalOpen(false);
    setIsPasswordModalOpen(false);
    setIsDuplicateModalOpen(false);
    setDuplicateNames([]);
    const participantNames = participants
      .split("\n")
      .map((name) => name.trim())
      .filter(Boolean);

    if (!title || !masterPassword) return;
    if (masterPassword.trim().length < 4) {
      setIsPasswordModalOpen(true);
      return;
    }
    const nameCounts = participantNames.reduce<Record<string, number>>(
      (acc, name) => {
        acc[name] = (acc[name] ?? 0) + 1;
        return acc;
      },
      {}
    );
    const duplicates = Object.keys(nameCounts).filter(
      (name) => nameCounts[name] > 1
    );
    if (duplicates.length > 0) {
      setDuplicateNames(duplicates);
      setIsDuplicateModalOpen(true);
      return;
    }
    if (participantNames.length < 3) {
      setIsMinCountModalOpen(true);
      return;
    }

    try {
      setLoading(true);
      const hostName = participantNames[0] ?? "";
      const id = await createRoom({
        title,
        hostName,
        masterPassword,
        participantNames,
      });
      setRoomId(id);
      const linkBase =
        typeof window !== "undefined" ? window.location.origin : "";
      const link = `${linkBase}/entry?roomId=${encodeURIComponent(
        id
      )}&title=${encodeURIComponent(title)}`;
      setEntryLink(link);
      setCopied(false);
      setMessageCopied(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="create-page">
      <div className="create-page__wrap">
        <div className="create-page__circle" />
        <div className="create-page__content">
          <div className="create-page__panel">
            <h2 className="create-page__title">방 만들기</h2>
            <div className="create-page__form">
              <FormField
                label="모임 이름"
                value={title}
                onChange={setTitle}
                placeholder="모임 이름을 입력해주세요."
              />
              <FormField
                label="방 비밀번호"
                value={masterPassword}
                onChange={setMasterPassword}
                placeholder="4자리 이상 입력해주세요."
                type="text"
              />
              <label className="create-page__list">
                <div className="create-page__list-head">
                  <span className="create-page__list-label">
                    참여자 명단
                  </span>
                  <span className="create-page__list-hint">
                    첫 줄에 방장 이름을 적어주세요.
                  </span>
                </div>
                <textarea
                  value={participants}
                  onChange={(event) => setParticipants(event.target.value)}
                  placeholder="첫 줄에 방장을 적고 줄바꿈으로 이름을 입력하세요."
                  rows={4}
                  className="create-page__textarea"
                />
              </label>
              <button
                onClick={onSubmit}
                disabled={loading}
                className="create-page__submit"
              >
                {loading ? "매칭 중..." : "매칭 시작"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {entryLink && isModalOpen ? (
        <div className="create-page__modal">
          <div className="create-page__modal-card">
            <div className="create-page__modal-header">
              <div>
                <h3 className="create-page__modal-title">공유하기</h3>
                <p className="create-page__modal-subtitle">
                  링크와 비밀번호를 공유하세요.
                </p>
              </div>
            </div>
            <div className="create-page__modal-info">
              모임 이름: <span className="create-page__modal-strong">{title}</span>
            </div>
            <div className="create-page__modal-link">
              <div className="create-page__modal-link-text">{entryLink}</div>
              <button
                onClick={async () => {
                  if (!navigator.clipboard) return;
                  await navigator.clipboard.writeText(entryLink);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="create-page__copy"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="create-page__copy-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15V5a2 2 0 012-2h10" />
                </svg>
                {copied ? "복사됨" : "링크 복사"}
              </button>
            </div>
            <div className="create-page__message">
              <p className="create-page__message-title">공유 메시지</p>
              <p className="create-page__message-text">
                {`[${title}] 마니또 방이 개설되었어요!\n참여 링크: ${entryLink}\n모임 이름: ${title}\n방 비밀번호: ${masterPassword}`}
              </p>
              <div className="create-page__message-actions">
                <button
                  onClick={async () => {
                    if (!navigator.clipboard) return;
                    await navigator.clipboard.writeText(
                      `[${title}] 마니또 방이 개설되었어요!\n참여 링크: ${entryLink}\n모임 이름: ${title}\n방 비밀번호: ${masterPassword}`
                    );
                    setMessageCopied(true);
                    setTimeout(() => setMessageCopied(false), 2000);
                  }}
                  className="create-page__message-copy"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="create-page__copy-icon"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15V5a2 2 0 012-2h10" />
                  </svg>
                  {messageCopied ? "메시지 복사됨" : "메시지 복사"}
                </button>
                <button
                  onClick={() => {
                    const templateId = Number(
                      import.meta.env.VITE_KAKAO_TEMPLATE_ID
                    );
                    if (!window.Kakao || !templateId) {
                      return;
                    }
                    const urlPath = `/entry?roomId=${encodeURIComponent(
                      roomId
                    )}&title=${encodeURIComponent(title)}`;
                    window.Kakao.Share.sendCustom({
                      templateId,
                      templateArgs: {
                        password: masterPassword,
                        name: title,
                        url: urlPath,
                      },
                    });
                  }}
                  className="create-page__kakao"
                >
                  <span className="create-page__kakao-icon">
                    <img
                      src={kakaoLogo}
                      alt="KakaoTalk"
                      className="create-page__kakao-image"
                    />
                  </span>
                  카카오톡 공유
                </button>
              </div>
            </div>
            <button
              onClick={() =>
                navigate(
                  `/entry?roomId=${encodeURIComponent(
                    roomId
                  )}&title=${encodeURIComponent(title)}`
                )
              }
              className="create-page__modal-cta"
            >
              마니또 확인하기
            </button>
          </div>
        </div>
      ) : null}
      {isMinCountModalOpen ? (
        <div className="create-page__modal">
          <div className="create-page__modal-card create-page__modal-card--small">
            <h3 className="create-page__modal-title">참여 인원 확인</h3>
            <p className="create-page__modal-subtitle">
              참여자는 3명 이상부터 만들 수 있어요.
            </p>
            <button
              onClick={() => setIsMinCountModalOpen(false)}
              className="create-page__modal-cta"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
      {isPasswordModalOpen ? (
        <div className="create-page__modal">
          <div className="create-page__modal-card create-page__modal-card--small">
            <h3 className="create-page__modal-title">비밀번호 확인</h3>
            <p className="create-page__modal-subtitle">
              방 비밀번호는 4글자 이상 입력해 주세요.
            </p>
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="create-page__modal-cta"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
      {isDuplicateModalOpen ? (
        <div className="create-page__modal">
          <div className="create-page__modal-card create-page__modal-card--small">
            <h3 className="create-page__modal-title">이름 중복</h3>
            <p className="create-page__modal-subtitle">
              중복된 이름이 있어요. 이름을 수정해 주세요.
            </p>
            <div className="create-page__chips">
              {duplicateNames.map((name) => (
                <span key={name} className="create-page__chip">
                  {name}
                </span>
              ))}
            </div>
            <button
              onClick={() => setIsDuplicateModalOpen(false)}
              className="create-page__modal-cta"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default CreatePage;
