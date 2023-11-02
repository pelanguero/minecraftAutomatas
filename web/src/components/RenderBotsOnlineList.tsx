import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import ProgressBar from 'react-bootstrap/ProgressBar'
import { State } from '@/state'
import { useNavigate, useParams } from 'react-router'
import { ListGroup } from 'react-bootstrap'

export const RenderBotsOnlineList: React.FC = () => {
  const { selectedSocketId } = useParams()

  const botState = useSelector((state: State) => state.botsReducer);
  const { botsOnline } = botState
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        navigate("/dashboard");
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const changeSelectedSocketId = (socketId: string) => {
    const currentPath = location.pathname;
    const newPath = !selectedSocketId ? `${currentPath}/${socketId}` : currentPath.replace(selectedSocketId, socketId);
    navigate(newPath)
  }

  const renderBotList = () => {
    return (
      botsOnline.map((bot) => {
        return (
          <ListGroup.Item
            action
            key={bot.socketId}
            variant={`${selectedSocketId === bot.socketId ? 'info' : ''}`}
            onClick={() => changeSelectedSocketId(bot.socketId)}
          >
            <div className={`${(bot.combat) ? 'text-danger fw-bolder' : ''}`}>
              <div>
                {bot.name}
              </div>
              <div>
                <ProgressBar className='mt-1' variant='danger' now={bot.health / 20 * 100} />
                <ProgressBar className='mt-1' variant='warning' now={bot.food / 20 * 100} />
              </div>
            </div>
          </ListGroup.Item>

        )
      })

    )
  }

  return (
    <ListGroup>
      <ListGroup.Item variant='primary'>
        Bots Online ({botsOnline.length})
      </ListGroup.Item>

      {renderBotList()}
    </ListGroup>

  )
}
