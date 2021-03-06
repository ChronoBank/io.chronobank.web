import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { FeatureModel } from 'src/models'
import { constantSelector } from 'src/store'
import styles from './FeaturesSection.sass'

@connect(mapStateToProps)
export default class FeaturesSection extends React.Component {

  static propTypes = {
    features: PropTypes.arrayOf(FeatureModel),
    constants: PropTypes.func,
  }

  render () {
    const { features, constants } = this.props
    return (
      <div className='root features-section'>
        <style jsx>{styles}</style>
        <div className='wrap'>
          <div className='content'>
            <h3>{ constants('labour-hour-features') }</h3>
            <ul>
              {features.map((feature) => (
                <li key={feature.id}>
                  <img src={feature.image.url} />
                  <h4>{feature.title}</h4>
                  <div className='text' dangerouslySetInnerHTML={{ __html: feature.brief }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    features: state.pages.features.array,
    constants: constantSelector(state),
  }
}
