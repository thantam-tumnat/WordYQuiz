package repository

import "gorm.io/gorm"

type highscoreRepositoryDB struct {
    db *gorm.DB
}

func NewHighScoreRepositoryDB(db *gorm.DB) highscoreRepositoryDB {
    return highscoreRepositoryDB{db: db}
}

func (r highscoreRepositoryDB) CreateHighScore(highscore HighScore) (*HighScore, error) {
    err := r.db.Create(&highscore).Error
    if err != nil {
        return nil, err
    }
    return &highscore, nil
}

func (r highscoreRepositoryDB) GetHighScore(highscoreID int) (*HighScore, error) {
    highscore := HighScore{}
    err := r.db.First(&highscore, highscoreID).Error
    if err != nil {
        return nil, err
    }
    return &highscore, nil
}

func (r highscoreRepositoryDB) GetHighScores() ([]HighScore, error) {
    highscores := []HighScore{}
    err := r.db.Order("id").Find(&highscores).Error
    if err != nil {
        return nil, err
    }
    return highscores, nil
}

func (r highscoreRepositoryDB) GetHighScoreByID(highscoreID int) (*HighScore, error) {
    highscore := HighScore{}
    err := r.db.First(&highscore, highscoreID).Error
    if err != nil {
        return nil, err
    }
    return &highscore, nil
}

func (r highscoreRepositoryDB) UpdateHighScore(highscoreID int, highscore HighScore) (*HighScore, error) {
    err := r.db.Model(&HighScore{}).Where("id = ?", highscoreID).Updates(&highscore).Error
    if err != nil {
        return nil, err
    }
    return &highscore, nil
}

func (r highscoreRepositoryDB) DeleteHighScore(highscoreID int) error {
    err := r.db.Delete(&HighScore{}, highscoreID).Error
    if err != nil {
        return err
    }
    return nil
}
