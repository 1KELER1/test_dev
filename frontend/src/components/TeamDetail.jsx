import { useState } from 'react';
import { Button, Typography, Card } from '@material-tailwind/react';
import { SendInvitation } from './SendInvitation';
import { InvitationList } from './InvitationList';

export const TeamDetail = ({ team }) => {
    const [showInviteDialog, setShowInviteDialog] = useState(false);

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <Typography variant="h4">{team.name}</Typography>
                        <Typography variant="small" color="gray">
                            {team.description}
                        </Typography>
                    </div>
                    <Button
                        color="blue"
                        onClick={() => setShowInviteDialog(true)}
                    >
                        Invite Member
                    </Button>
                </div>
            </Card>

            <InvitationList />

            <SendInvitation
                teamId={team.id}
                isOpen={showInviteDialog}
                onClose={() => setShowInviteDialog(false)}
            />
        </div>
    );
}; 