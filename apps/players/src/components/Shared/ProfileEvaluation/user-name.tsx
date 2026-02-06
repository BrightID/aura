import { useSubjectName } from '@/hooks/useSubjectName';

const UserName = ({ subjectId }: { subjectId: string }) => {
  const name = useSubjectName(subjectId);
  return (
    <p className="line-clamp-1 text-ellipsis text-sm font-medium">{name}</p>
  );
};

export default UserName;
