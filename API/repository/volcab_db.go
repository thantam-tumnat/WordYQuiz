package repository

import "gorm.io/gorm"

type volcabRepositoryDB struct {
	db *gorm.DB
}

func NewVolcabRepositoryDB(db *gorm.DB) volcabRepositoryDB {
	return volcabRepositoryDB{db: db}
}

func (r volcabRepositoryDB) CreateVolcab(volcab Volcab) (*Volcab, error) {
	err := r.db.Create(&volcab).Error
	if err != nil {
		return nil, err
	}
	return &volcab, nil
}

func (r volcabRepositoryDB) GetVolcab(volcabID int) (*Volcab, error) {
	volcab := Volcab{}
	err := r.db.First(&volcab, volcabID).Error
	if err != nil {
		return nil, err
	}
	return &volcab, nil
}

func (r volcabRepositoryDB) GetVolcabs() ([]Volcab, error) {
	volcab := []Volcab{}
	err := r.db.Order("id").Find(&volcab).Error
	if err != nil {
		return nil, err
	}
	return volcab, nil
}
func (r volcabRepositoryDB) GetVolcabByID(volcabID int) (*Volcab, error) {
	volcab := Volcab{}
	err := r.db.First(&volcab, volcabID).Error
	if err != nil {
		return nil, err
	}
	return &volcab, nil
}

func (r volcabRepositoryDB) UpdateVolcab(volcabID int, volcab Volcab) (*Volcab, error) {
	err := r.db.Model(&Volcab{}).Where("id = ?", volcabID).Updates(&volcab).Error
	if err != nil {
		return nil, err
	}
	return &volcab, nil
}

func (r volcabRepositoryDB) DeleteVolcab(volcabID int) error {
	err := r.db.Delete(&Volcab{}, volcabID).Error
	if err != nil {
		return err
	}
	return nil
}
