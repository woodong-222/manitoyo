import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import FormField from "../../components/FormField";
import { getRoom, listParticipants } from "../../lib/firestore";
import type { Participant } from "../../lib/types";
import "./EntryPage.css";

function EntryPage() {
  const [roomId, setRoomId] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedName, setSelectedName] = useState("");
  const [roomTitle, setRoomTitle] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isPasswordErrorModalOpen, setIsPasswordErrorModalOpen] =
    useState(false);
  const [isRevealedModalOpen, setIsRevealedModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const roomIdParam = searchParams.get("roomId");
    const titleParam = searchParams.get("title");
    if (roomIdParam) {
      setRoomId(roomIdParam);
    }
    if (titleParam) {
      setRoomTitle(titleParam);
    }
  }, [searchParams]);

  const loadParticipants = async () => {
    if (!roomId || !roomPassword) {
      return;
    }
    try {
      setLoading(true);
      const room = await getRoom(roomId);
      if (!room) {
        return;
      }
      setRoomTitle(room.title);
      if (room.masterPassword !== roomPassword) {
        setIsPasswordErrorModalOpen(true);
        return;
      }
      const list = await listParticipants(roomId);
      setParticipants(list);
      setVerified(true);
      if (room.isRevealed) {
        setIsRevealedModalOpen(true);
      } else {
        setIsNameModalOpen(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="entry-page">
      <div className="entry-page__wrap">
        <div className="entry-page__circle" />
        <div className="entry-page__content">
          <div className="entry-page__panel">
            <h2 className="entry-page__title">참여자 입장</h2>
            <p className="entry-page__subtitle">
              방 비밀번호를 입력하면 참여자 목록을 선택할 수 있어요.
            </p>
            <div className="entry-page__form">
              {roomTitle ? (
                <div className="entry-page__room-title">
                  모임 이름:{" "}
                  <span className="entry-page__room-strong">{roomTitle}</span>
                </div>
              ) : null}
              <FormField
                label="방 비밀번호"
                value={roomPassword}
                onChange={setRoomPassword}
                placeholder="방장님이 공유한 비밀번호를 입력해주세요."
                type="text"
              />
              <button
                onClick={loadParticipants}
                disabled={loading}
                className="entry-page__submit"
              >
                {loading ? "불러오는 중..." : "마니또 입장"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isNameModalOpen ? (
        <div className="entry-page__modal">
          <div className="entry-page__modal-card">
            <div className="entry-page__modal-header">
              <div>
                <h3 className="entry-page__modal-title">이름 선택</h3>
                <p className="entry-page__modal-subtitle">
                  본인 이름을 선택해 주세요.
                </p>
              </div>
              <button
                onClick={() => setIsNameModalOpen(false)}
                aria-label="닫기"
                className="entry-page__modal-close"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="entry-page__modal-close-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="entry-page__name-grid">
              {participants.map((participant) => {
                const selected = selectedName === participant.name;
                const joined = participant.isJoined;
                const stateClass = selected
                  ? "entry-page__name-button--selected"
                  : joined
                  ? "entry-page__name-button--joined"
                  : "entry-page__name-button--default";
                return (
                  <button
                    key={participant.id}
                    onClick={() => {
                      setSelectedName(participant.name);
                      if (!verified) return;
                      setIsNameModalOpen(false);
                      navigate(
                        `/auth?roomId=${encodeURIComponent(
                          roomId
                        )}&name=${encodeURIComponent(participant.name)}`
                      );
                    }}
                    className={`entry-page__name-button ${stateClass}`}
                  >
                    {joined ? (
                      <span className="entry-page__lock">
                        <svg
                          viewBox="0 0 24 24"
                          className="entry-page__lock-icon"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="11" width="18" height="10" rx="2" />
                          <path d="M7 11V7a5 5 0 0110 0v4" />
                        </svg>
                      </span>
                    ) : null}
                    <span>{participant.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
      {isRevealedModalOpen ? (
        <div className="entry-page__modal">
          <div className="entry-page__modal-card">
            <div className="entry-page__modal-header">
              <div>
                <h3 className="entry-page__modal-title">전체 공개</h3>
                <p className="entry-page__modal-subtitle">
                  마니또 결과가 공개되었습니다.
                </p>
              </div>
              <button
                onClick={() => setIsRevealedModalOpen(false)}
                aria-label="닫기"
                className="entry-page__modal-close"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="entry-page__modal-close-icon"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="entry-page__result-list">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="entry-page__result-item"
                >
                  {participant.name} → {participant.targetName}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      {isPasswordErrorModalOpen ? (
        <div className="entry-page__modal">
          <div className="entry-page__modal-card entry-page__modal-card--small">
            <h3 className="entry-page__modal-title">비밀번호 오류</h3>
            <p className="entry-page__modal-subtitle">
              방 비밀번호가 일치하지 않습니다.
            </p>
            <button
              onClick={() => setIsPasswordErrorModalOpen(false)}
              className="entry-page__modal-cta"
            >
              확인
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default EntryPage;
