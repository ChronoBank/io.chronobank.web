import React from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'

import { BACKEND } from 'src/endpoints'
import { AccordeonPanel, ReferencePanel, SearchPanel, SectionsPanel } from 'src/components'

import styles from './FaqSection.sass'

export default class FaqSection extends React.Component {

  static propTypes = {
    topics: PropTypes.array
  }

  constructor (props) {
    super(props)
    this.handleSearchDebounced = debounce(this.handleSearch, 500)

    const topics = new Map()
    for (const t of props.topics) {
      if (t.questions && t.questions.length) {
        topics.set(t._id, {
          id: t._id,
          title: t.title,
          route: '',
          questions: t.questions.map(q => ({
            id: q._id,
            title: q.title,
            brief: q.brief
          }))
        })
      }
    }

    this.state = {
      query: null,
      topic: null,
      topics,
      reference: [...topics.values()],
      results: [...topics.values()]
    }
  }

  render () {
    const { query, topic, reference, results } = this.state
    return (
      <div className='root faq-section'>
        <style jsx>{styles}</style>
        <div className='wrap'>
          <div className='content'>
            <div className='left'>
              <div className='search'>
                <SearchPanel onChange={(query) => this.handleSearchDebounced({ query, topic })} />
              </div>
              <div className='topics'>
                <ReferencePanel items={reference} onChange={(topic) => this.handleSearch({ query, topic })} />
              </div>
            </div>
            <div className='right'>
              <div className='search'>
                <SearchPanel onChange={(query) => this.handleSearchDebounced({ query, topic })} />
              </div>
              <div className='results'>
                {!results.length
                  ? (
                    <div className='no-results'>No relevant results</div>
                  )
                  : (
                    <SectionsPanel styleName='topics' className='topics' items={results.map(topic => ({
                      id: topic.id,
                      title: topic.title,
                      content: (
                        <AccordeonPanel items={topic.questions.map(question => ({
                          id: question.id,
                          title: question.title,
                          isOpen: question.isOpen,
                          content: (
                            <div className='text' dangerouslySetInnerHTML={{ __html: question.brief}}></div>
                          )
                        }))} />
                      )
                    }))} />
                  )
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  async handleSearch ({ query, topic }) {
    const state = this.state
    // eslint-disable-next-line

    if ((query !== null && query !== '' && query !== '*') || topic) {
      const { data } = await BACKEND.get('faq-questions/search', {
        params: {
          query: (query !== null && query !== '' && query !== '*') ? query : null,
          topic
        }
      })

      const results = new Map()
      let count = 0
      for (const q of data.elements) {
        if (q.document.topic) {
          const t = state.topics.get(q.document.topic)
          if (t) {
            const storedTopic = results.get(q.document.topic)
            const questions = storedTopic ? storedTopic.questions : []
            results.set(t.id, {
              ...t,
              questions: [...questions, {
                id: q.document._id,
                isOpen: !count || (q.score > 3),
                title: q.document.title,
                brief: q.document.brief
              }]
            })
            count++
          }
        }
      }

      const reference = new Map()
      for (const t of state.topics.values()) {
        reference.set(t.id, {
          ...t,
          isActive: t.id === topic,
          isNotRelevant: !results.get(t.id)
        })
      }

      this.setState({
        query,
        topic,
        reference: [...reference.values()],
        results: [...results.values()]
      })

    } else {
      this.setState({
        query: null,
        topic: null,
        reference: [...state.topics.values()],
        results: [...state.topics.values()]
      })
    }
  }
}