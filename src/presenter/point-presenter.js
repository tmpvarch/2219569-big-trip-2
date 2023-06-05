import { render, replace, remove } from '../framework/render';
import EditPointView from '../view/edit-point';
import PointView from '../view/point';
import { UserAction, UpdateType } from '../const';

const Mode = {
    DEFAULT: 'DEFAULT',
    EDITING: 'EDITING',
  };
  
  export default class PointPresenter {
    #pointsListContainer = null;
  
    #changeMode = null;
    #handleDataChange = null;
  
    #pointComponent = null;
    #editPointComponent = null;
  
    #point = null;
    #mode = Mode.DEFAULT;
    #destinations = null;
    #offersByType = null;
  
    constructor({ container, destinations, offersByType, changeData, changeMode }) {
      this.#pointsListContainer = container;
      this.#destinations = destinations;
      this.#offersByType = offersByType;
      this.#handleDataChange = changeData;
      this.#changeMode = changeMode;
    }
  
    init(point) {
      this.#point = point;
  
      const prevPointComponent = this.#pointComponent;
      const prevEditPointComponent = this.#editPointComponent;
  
      this.#pointComponent = new PointView({
        point: point,
        destinations: this.#destinations,
        offersByType: this.#offersByType,
        editClick: this.#handleEditClick,
        favoriteClick: this.#handleFavouriteClick,
      });
  
      this.#editPointComponent = new EditPointView({
        point: point,
        destinations: this.#destinations,
        offersByType: this.#offersByType,
        saveClick: this.#handleSaveForm,
        closeClick: this.#handleCloseForm,
        deleteClick: this.#handleDeletePoint,
      });
  
      if (prevPointComponent === null && prevEditPointComponent === null) {
        render(this.#pointComponent, this.#pointsListContainer);
        return;
      }
  
      if (this.#mode === Mode.DEFAULT) {
        replace(this.#pointComponent, prevPointComponent);
      }
  
      if (this.#mode === Mode.EDITING) {
        render(this.#editPointComponent, prevEditPointComponent);
      }
  
      remove(prevPointComponent);
      remove(prevEditPointComponent);
    }
  
    destroy = () => {
      remove(this.#pointComponent);
      remove(this.#editPointComponent);
    };
  
    resetView = () => {
      if (this.#mode !== Mode.DEFAULT) {
        this.#editPointComponent.reset(this.#point);
        this.#replaceFormToPoint();
      }
    };
  
    #onEscKeyDown = (evt) => {
      if (evt.key === 'Escape' || evt.key === 'Esc') {
        evt.preventDefault();
        this.#replaceFormToPoint();
        this.#editPointComponent.reset(this.#point);
        document.removeEventListener('keydown', this.#onEscKeyDown);
      }
    };
  
    #replacePointToForm = () => {
      replace(this.#editPointComponent, this.#pointComponent);
      document.addEventListener('keydown', this.#onEscKeyDown);
      this.#changeMode();
      this.#mode = Mode.EDITING;
    };
  
    #replaceFormToPoint = () => {
      replace(this.#pointComponent, this.#editPointComponent);
      document.removeEventListener('keydown', this.#onEscKeyDown);
      this.#mode = Mode.DEFAULT;
    };
  
    #handleEditClick = () => {
      this.#replacePointToForm();
    };
  
    #handleCloseForm = () => {
      this.#editPointComponent.reset(this.#point);
      this.#replaceFormToPoint();
    };
  
    #handleSaveForm = (update) => {
      this.#handleDataChange(UserAction.UPDATE_POINT, UpdateType.MINOR, update);
      this.#replaceFormToPoint();
    };
  
    #handleFavouriteClick = () => {
      this.#handleDataChange(UserAction.UPDATE_POINT, UpdateType.PATCH, {
        ...this.#point,
        isFavorite: !this.#point.isFavorite,
      });
    };

    #handleDeletePoint = (point) => {
      this.#handleDataChange(UserAction.DELETE_POINT, UpdateType.MINOR, point);
    };
  }