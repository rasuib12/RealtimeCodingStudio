import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface User {
  id: number;
  username: string;
}

interface UserPresenceProps {
  users: User[];
}

export function UserPresence({ users }: UserPresenceProps) {
  return (
    <div className="flex items-center gap-2">
      {users.map((user) => (
        <Badge key={user.id} variant="secondary" className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback>{user.username[0]}</AvatarFallback>
          </Avatar>
          {user.username}
        </Badge>
      ))}
    </div>
  );
}
