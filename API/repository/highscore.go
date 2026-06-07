package repository

type HighScore struct {
	ID         int    `db:"id" gorm:"not null"`
	PlayerName string `db:"playername"`
	Score      string `db:"score"`
}
type HighScoreRepository interface {
	CreateHighScore(HighScore) (*HighScore, error)
	UpdateHighScore(int, HighScore) (*HighScore, error)
	GetHighScoreByID(int) (*HighScore, error)
	GetHighScores() ([]HighScore, error)
	DeleteHighScore(int) error
}
