import { useEffect, useState } from "react";
import FormField from "../../components/FormField";
import {
  getMyTarget,
  revealRoom,
  subscribeParticipants,
  subscribeRoom,
} from "../../lib/firestore";
import type { Participant, Room } from "../../lib/types";
import "./ResultPage.css";

function ResultPage() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const [personalPassword, setPersonalPassword] = useState("");
  const [targetName, setTargetName] = useState("");
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [masterPassword, setMasterPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomId) return;
    const unsubscribeRoom = subscribeRoom(roomId, setRoom);
    const unsubscribeParticipants = subscribeParticipants(
      roomId,
      setParticipants
    );
    return () => {
      unsubscribeRoom();
      unsubscribeParticipants();
    };
  }, [roomId]);

  const handleCheck = async () => {
    setTargetName("");
    if (!roomId || !name || !personalPassword) {
      return;
    }
    try {
      setLoading(true);
      const result = await getMyTarget({ roomId, name, personalPassword });
      if (!result) {
        return;
      }
      setTargetName(result.targetName);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReveal = async () => {
    if (!roomId || !masterPassword) {
      return;
    }
    try {
      setLoading(true);
      if (!room || room.masterPassword !== masterPassword) {
        return;
      }
      await revealRoom(roomId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="result-page">
      <div className="result-page__wrap">
        <div className="result-page__circle" />
        <div className="result-page__content">
          <div className="result-page__panel">
            <h2 className="result-page__title">결과 확인</h2>
            <p className="result-page__subtitle">
              내 마니또 확인과 전체 공개 상태를 확인합니다.
            </p>
            <div className="result-page__form">
              <FormField
                label="방 ID"
                value={roomId}
                onChange={setRoomId}
                placeholder="방 ID"
              />
              <FormField
                label="이름"
                value={name}
                onChange={setName}
                placeholder="본인 이름"
              />
              <FormField
                label="개인 비밀번호"
                value={personalPassword}
                onChange={setPersonalPassword}
                placeholder="개인 비밀번호를 입력해주세요."
                type="text"
              />
              <button
                onClick={handleCheck}
                disabled={loading}
                className="result-page__submit"
              >
                {loading ? "확인 중..." : "내 마니또 확인"}
              </button>
              {targetName ? (
                <div className="result-page__target">
                  내 마니또:{" "}
                  <span className="result-page__target-strong">
                    {targetName}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="result-page__wrap">
        <div className="result-page__circle" />
        <div className="result-page__content">
          <div className="result-page__panel">
            <h3 className="result-page__title-sm">전체 공개</h3>
            <p className="result-page__subtitle">
              방장 전용 기능입니다. 공개하면 전체 매칭이 표시됩니다.
            </p>
            <div className="result-page__form-sm">
              <FormField
                label="관리 비밀번호"
                value={masterPassword}
                onChange={setMasterPassword}
                placeholder="관리자 비밀번호"
                type="text"
              />
              <button
                onClick={handleReveal}
                disabled={loading}
                className="result-page__ghost"
              >
                전체 공개 시작
              </button>
              {room ? (
                <div className="result-page__status">
                  공개 상태: {room.isRevealed ? "공개됨" : "대기 중"}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {room ? (
        <div className="result-page__summary">
          <div className="result-page__summary-row">
            <span className="result-page__summary-strong">
              공개 상태: {room.isRevealed ? "공개됨" : "대기 중"}
            </span>
            <span className="result-page__summary-hint">
              {room.hostName ? `방장: ${room.hostName}` : "방장 정보 없음"}
            </span>
          </div>
          {!room.isRevealed ? (
            <p className="result-page__summary-desc">
              방장님께서 공개 버튼을 누르면 전체 결과가 보입니다.
            </p>
          ) : null}
        </div>
      ) : null}

      {room?.isRevealed ? (
        <div className="result-page__wrap">
          <div className="result-page__circle" />
          <div className="result-page__content">
            <div className="result-page__panel">
              <h3 className="result-page__title-sm">전체 결과</h3>
              <div className="result-page__result-list">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="result-page__result-item"
                  >
                    {participant.name} → {participant.targetName}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default ResultPage;
