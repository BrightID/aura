const NewEvaluationCard = ({
  subjectId,
  setShowEvaluationFlow,
}: {
  subjectId: string;
  setShowEvaluationFlow: (value: boolean) => void;
}) => {
  return (
    <div>
      <div className="flex items-center w-full gap-2">
        <EvaluateButton
          setShowEvaluationFlow={setShowEvaluationFlow}
          subjectId={subjectId}
          textColor=""
          bgColor="btn"
          image="/assets/images/SubjectProfile/subject-evaluation-big.svg"
        />
      </div>
    </div>
  );
};

export default NewEvaluationCard;

const EvaluateButton = ({
  bgColor,
  textColor,
  image,
  subjectId,
  setShowEvaluationFlow,
}: {
  bgColor: string;
  textColor: string;
  image: string;
  subjectId: string;
  setShowEvaluationFlow: (value: boolean) => void;
}) => {
  return (
    <>
      <div
        onClick={() => setShowEvaluationFlow(true)}
        data-testid={`evaluate-not-evaluated-subject-${subjectId}`}
        className={`flex gap-2.5 justify-center w-full items-center ${bgColor} cursor-pointer`}
      >
        <div>
          <img src={image} alt="" />
        </div>
        <div className={`font-bold ${textColor}`}>Evaluate Now!</div>
      </div>
    </>
  );
};
