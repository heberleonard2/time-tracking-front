import { useCallback, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { parseCookies } from 'nookies'
import DayPicker, { DayModifiers } from 'react-day-picker'
import 'react-day-picker/lib/style.css'
import { useTimeReport } from '../../hooks/useTimeReport'
import { api } from '../../services/api'

import { Header } from '../../components/Header'
import {
  Container,
  Calendar,
  ReportContainer,
  Entrance,
  Exit,
  NoReports
} from '../../styles/pages/dashboard/historic'
import { ImArrowDownLeft, ImArrowUpRight } from 'react-icons/im'

export default function Historic() {
  const {
    selectedDate,
    setSelectedDate,
    setReports,
    selectedDateAsText,
    timeReportsWithFormatDate
  } = useTimeReport()

  useEffect(() => {
    api
      .get(`/worktime`, {
        params: {
          date: selectedDate.toISOString()
        }
      })
      .then(response => setReports(response.data))
  }, [selectedDate, setReports])

  const handleDateChange = useCallback(
    (day: Date, modifiers: DayModifiers) => {
      if (modifiers.available) {
        setSelectedDate(day)
      }
    },
    [setSelectedDate]
  )

  return (
    <>
      <Head>
        <title>Dashboard | Reports</title>
      </Head>
      <Header />
      <Container>
        <Calendar>
          <DayPicker
            modifiers={{
              available: { daysOfWeek: [0, 1, 2, 3, 4, 5, 6] }
            }}
            selectedDays={selectedDate}
            onDayClick={handleDateChange}
          />
        </Calendar>
        <ReportContainer>
          <h1>{selectedDateAsText}</h1>
          {timeReportsWithFormatDate.length > 0 ? (
            timeReportsWithFormatDate.map(report => (
              <div key={report._id}>
                {report.type === 'entrance' ? (
                  <Entrance>
                    <ImArrowDownLeft />
                  </Entrance>
                ) : (
                  <Exit>
                    <ImArrowUpRight />
                  </Exit>
                )}
                <section>
                  <h3>{report.createdAt}</h3>
                  <p>{report.description}</p>
                </section>
              </div>
            ))
          ) : (
            <NoReports>
              <img src="/images/no-task.png" alt="no-task" />
              <h1>There&apos;s nothing here</h1>
            </NoReports>
          )}
        </ReportContainer>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ctx => {
  const { 'solides.token': token } = parseCookies(ctx)

  if (!token) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}
