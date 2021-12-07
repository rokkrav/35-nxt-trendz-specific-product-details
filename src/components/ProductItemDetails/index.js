import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'

import Header from '../Header'
import SimilarProductItem from '../SimilarProductItem'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    productData: {},
    similarProductsData: [],
    quantity: 1,
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getProductItemDetails()
  }

  formatDataToCamelCase = data => ({
    availability: data.availability,
    brand: data.brand,
    description: data.description,
    id: data.id,
    imageUrl: data.image_url,
    price: data.price,
    rating: data.rating,
    style: data.style,
    title: data.title,
    totalReviews: data.total_reviews,
  })

  getProductItemDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {match} = this.props
    const {params} = match
    const {id} = params

    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const jwtToken = Cookies.get('jwt_token')
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    if (response.ok === true) {
      const data = await response.json()
      const formattedData = this.formatDataToCamelCase(data)
      const similarProducts = data.similar_products.map(eachProduct =>
        this.formatDataToCamelCase(eachProduct),
      )
      this.setState({
        productData: formattedData,
        similarProductsData: similarProducts,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderLoader = () => (
    <div testid="loader" className="products-details-loader-container">
      <Loader type="ThreeDots" color="#0b69ff" height={80} width={80} />
    </div>
  )

  renderFailureView = () => (
    <div className="failure-view-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
        alt="failure view"
        className="error-view-img"
      />
      <h1 className="error-view-heading">Product Not Found</h1>
      <Link to="/products">
        <button type="button" className="error-view-button">
          Continue Shopping
        </button>
      </Link>
    </div>
  )

  incrementQuantity = () => {
    this.setState(prevState => ({quantity: prevState.quantity + 1}))
  }

  decrementQuantity = () => {
    const {quantity} = this.state
    if (quantity > 1) {
      this.setState(prevState => ({quantity: prevState.quantity - 1}))
    }
  }

  renderProductItemDetails = () => {
    const {productData, similarProductsData, quantity} = this.state
    const {
      imageUrl,
      availability,
      brand,
      description,
      price,
      rating,
      title,
      totalReviews,
    } = productData
    return (
      <div className="product-item-container">
        <div className="selected-product-container">
          <img src={imageUrl} alt="product" className="product-item-img" />
          <div className="selected-product-details-container">
            <h1 className="product-title">{title}</h1>
            <p className="product-price"> Rs {price}/- </p>
            <div className="rating-review-container">
              <div className="rating-container">
                <p className="product-rating">{rating}</p>
                <img
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                  className="star-img"
                />
              </div>
              <p className="product-review">{totalReviews} Reviews</p>
            </div>
            <p className="product-description">{description}</p>
            <div className="label-value-container">
              <p className="product-label">Available: </p>
              <p className="product-label-value">{availability}</p>
            </div>
            <div className="label-value-container">
              <p className="product-label">Brand: </p>
              <p className="product-label-value">{brand}</p>
            </div>
            <hr className="line" />
            <div className="quantity-count-container">
              <button
                type="button"
                className="count-icon-button"
                onClick={this.decrementQuantity}
                testid="minus"
              >
                <BsDashSquare className="count-icon" />
              </button>
              <p className="quantity-count">{quantity}</p>
              <button
                type="button"
                className="count-icon-button"
                onClick={this.incrementQuantity}
                testid="plus"
              >
                <BsPlusSquare className="count-icon" />
              </button>
            </div>
            <button type="button" className="add-to-cart-button">
              ADD TO CART
            </button>
          </div>
        </div>
        <h1 className="similar-products-heading">Similar Products</h1>
        <ul className="similar-products-list">
          {similarProductsData.map(eachProduct => (
            <SimilarProductItem
              key={eachProduct.id}
              productDetails={eachProduct}
            />
          ))}
        </ul>
      </div>
    )
  }

  renderProductDetails = () => {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderProductItemDetails()
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }

  render() {
    return (
      <>
        <Header />
        <div className="product-item-details-container">
          {this.renderProductDetails()}
        </div>
      </>
    )
  }
}

export default ProductItemDetails
