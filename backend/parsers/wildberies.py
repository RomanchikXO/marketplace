import aiohttp
from datetime import datetime, timedelta
import json
from database.funcs_db import get_data_from_db, add_set_data_from_db
from database.DataBase import async_connect_to_database
from django.utils.dateparse import parse_datetime

import logging
from context_logger import ContextLogger
logger = ContextLogger(logging.getLogger("parsers"))


async def wb_api(session, param):
    """
    Асинхронная функция для получения данных по API Wildberries.
    :param param:
    :return:
    """

    API_URL = ''
    view = ''
    data = {}
    params = {}

    if param["type"] == "info_about_rks":
        API_URL = "https://advert-api.wildberries.ru/adv/v1/promotion/adverts"
        data = param['id_lks']  # максимум 50 рк
        view = "post"

    if param["type"] == "list_adverts_id":
        API_URL = "https://advert-api.wildberries.ru/adv/v1/promotion/count"
        view = "get"

    if param["type"] == "get_balance_lk":
        # получить balance-счет net-баланс bonus-бонусы личный кабинет
        # Максимум 1 запрос в секунду на один аккаунт продавца
        API_URL = "https://advert-api.wildberries.ru/adv/v1/balance"
        view = "get"

    if param["type"] == "orders":
        # Максимум 1 запрос в минуту на один аккаунт продавца
        # Данные обновляются раз в 30 минут.
        API_URL = "https://statistics-api.wildberries.ru/api/v1/supplier/orders"
        params = {
            "dateFrom": param["date_from"], #Дата и время последнего изменения по заказу. `2019-06-20` `2019-06-20T23:59:59`
            "flag": param["flag"],  #если flag=1 то только за выбранный день если 0 то
            # со дня до сегодня но не более 100000 строк
        }
        view = "get"

    if param["type"] == "start_advert":
        # запустить рекламу
        # Максимум 5 запросов в секунду на один аккаунт продавца
        API_URL = "https://advert-api.wildberries.ru/adv/v0/start"
        params = {
            "id": param["advert_id"],  # int
        }
        view = "get"

    if param["type"] == "budget_advert":
        # получить бюджет кампании
        # Максимум 4 запроса в секунду на один аккаунт продавца
        API_URL = "https://advert-api.wildberries.ru/adv/v1/budget"
        params = {
            "id": param["advert_id"],  # int
        }
        view = "get"

    if param["type"] == "add_bidget_to_adv":
        # пополнить бюджет рекламной кампании
        # Максимум 1 запрос в секунду на один аккаунт продавца
        API_URL = "https://advert-api.wildberries.ru/adv/v1/budget/deposit"
        params = {
            "id": param["advert_id"],
        }
        data = {
            "sum": param["sum"],  # int
            "type": param["source"],  # int: 0-счет 1-баланс 3-бонусы
            "return": param["return"],  # bool: в ответе вернется обновлённый размер бюджета кампании если True
        }

        view = "post"

    if param["type"] == "get_nmids":
        # получить все артикулы
        # Максимум 100 запросов в минуту для всех методов категории Контент на один аккаунт продавца
        API_URL = "https://content-api.wildberries.ru/content/v2/get/cards/list"

        data = {
            "settings": {
                "cursor": {
                    "limit": 100
                },
                "filter": {
                    "withPhoto": -1
                },
            }
        }
        if param.get("updatedAt"):
            data["settings"]["cursor"]["updatedAt"] = param["updatedAt"]
        if param.get("nmID"):
            data["settings"]["cursor"]["nmID"] = param["nmID"]
        view = "post"

    if param["type"] == "get_delivery_fbw":
        API_URL = "https://statistics-api.wildberries.ru/api/v1/supplier/incomes"

        params = {
            "dateFrom": param["dateFrom"]
        }

        view = "get"

    if param["type"] == "get_products_and_prices":
        # получить товары с ценами
        # максимальный лимит 1000
        API_URL = "https://discounts-prices-api.wildberries.ru/api/v2/list/goods/filter"
        params = {
            "limit": param.get("limit", 1000)
        }
        view = "get"

    # сортировка по nmID/предметам/брендам/тегам
    if param["type"] == 'get_stat_cart_sort_nm':
        API_URL = "https://seller-analytics-api.wildberries.ru/api/v2/nm-report/detail"
        data = {
            "period": {
                "begin": param["begin"],
                "end": param["end"],
            },
            "page": 1
        }
        view = "post"

    if param["type"] == "get_feedback":
        # Максимум 1 запрос в секунду
        # Если превысить лимит в 3 запроса в секунду, отправка запросов будет заблокирована на 60 секунд
        API_URL = "https://feedbacks-api.wildberries.ru/api/v1/feedbacks"
        params = {
            "isAnswered": param["isAnswered"],  # str: Обработанные отзывы (True) или необработанные отзывы(False)
            "take": param["take"],  # int: Количество отзывов (max. 5 000)
            "skip": param["skip"],  # int: Количество отзывов для пропуска (max. 199990)

        }
        if param.get("nmId"):  # по артикулу
            params["nmId"] = param["nmId"]
        if param.get("order"):  # str: сортировка по дате "dateAsc" "dateDesc"
            params["order"] = param["order"]
        if param.get("dateFrom"):  # int: Дата начала периода в формате Unix timestamp
            params["dateFrom"] = param["dateFrom"]
        if param.get("dateTo"):  # int: Дата конца периода в формате Unix timestamp
            params["dateTo"] = param["dateTo"]
        view = "get"

    if param["type"] == "warehouse_data":
        # Максимум 3 запроса в минуту на один аккаунт продавца
        # Метод формирует набор данных об остатках по складам.
        # Данные по складам Маркетплейс (FBS) приходят в агрегированном виде — по всем сразу, без детализации по
        # конкретным складам — эти записи будут с "regionName":"Маркетплейс" и "offices":[].
        API_URL = "https://seller-analytics-api.wildberries.ru/api/v2/stocks-report/offices"

        data = {
            "currentPeriod": {
                "start": param["start"], #"2024-02-10" Не позднее end. Не ранее 3 месяцев от текущей даты
                "end": param["end"], #Дата окончания периода. Не ранее 3 месяцев от текущей даты
            },
            "stockType": "" if not param.get("stockType") else param["stockType"], #"" — все wb—Склады WB mp—Склады Маркетплейс (FBS)
            "skipDeletedNm": True if not param.get("skipDeletedNm") else param["skipDeletedNm"], #Скрыть удалённые товары
        }

        view = "post"

    if param["type"] == "seller_analytics_generate":
        # Метод создаёт задание на генерацию отчёта с расширенной аналитикой продавца.
        # Максимальное количество отчётов, генерируемых в сутки — 20.
        # Максимум 3 запроса в минуту на один аккаунт продавца
        API_URL = "https://seller-analytics-api.wildberries.ru/api/v2/nm-report/downloads"

        # https://dev.wildberries.ru/openapi/analytics#tag/Analitika-prodavca-CSV/paths/~1api~1v2~1nm-report~1downloads/post
        # Ниже типы reportType
        # DETAIL_HISTORY_REPORT GROUPED_HISTORY_REPORT SEARCH_QUERIES_PREMIUM_REPORT_GROUP
        # SEARCH_QUERIES_PREMIUM_REPORT_PRODUCT SEARCH_QUERIES_PREMIUM_REPORT_TEXT STOCK_HISTORY_REPORT_CSV

        statuses = [
            "deficient",
            "actual",
            "balanced",
            "nonActual",
            "nonLiquid",
            "invalidData"
        ]

        data = {
            "id": param["id"], # ID отчёта в UUID-формате
            "reportType": param["reportType"],
            "userReportName": param["userReportName"], # Название отчета
        }
        if param["reportType"] == "DETAIL_HISTORY_REPORT":
            data["params"] = {
                "startDate": param["start"],  # str
                "endDate": param["end"],
                "skipDeletedNm": param.get("skipDeletedNm", True),  # скрыть удаленные товары
            }
        elif param["reportType"] == "STOCK_HISTORY_REPORT_CSV":
            data["params"] = {
                "currentPeriod": {
                    "start": param["start"],
                    "end": param["end"],
                },  # str
                "stockType": param.get("stockType", ""),
                "skipDeletedNm": param.get("skipDeletedNm", True),  # скрыть удаленные товары
                "availabilityFilters": param.get("availabilityFilters", statuses), # List[str]
                "orderBy": {
                    "field": param.get("orderBy", "officeMissingTime"),
                    "mode": param.get("mode", "desc"),
                }
            }

        view = "post"

    if param["type"] == "seller_analytics_report":
        # Можно получить отчёт, который сгенерирован за последние 48 часов.
        # Отчёт будет загружен внутри архива ZIP в формате CSV.
        # Максимум 3 запроса в минуту на один аккаунт продавца
        API_URL = f"https://seller-analytics-api.wildberries.ru/api/v2/nm-report/downloads/file/{param['downloadId']}"

        params = {
            "downloadId": param["downloadId"], # string <uuid>
        }
        view = "get"

    if param["type"] == "get_stocks_data":
        # Метод предоставляет количество остатков товаров на складах WB.
        # Данные обновляются раз в 30 минут.
        # Максимум 1 запрос в минуту на один аккаунт продавца

        params = {"dateFrom": param["dateFrom"]} #"2019-06-20"  Время передаётся в часовом поясе Мск (UTC+3).
        API_URL = "https://statistics-api.wildberries.ru/api/v1/supplier/stocks"

        view = "get"

    if param["type"] == "set_price_and_discount":
        # Метод устанавливает цены и скидки для товаров.
        # Максимум 10 запросов за 6 секунд
        # Максимум 1 000 товаров
        # Цена и скидка не могут быть пустыми одновременно
        # Если новая цена со скидкой будет хотя бы в 3 раза меньше старой, она попадёт в карантин, и товар будет продаваться по старой цене
        API_URL = "https://discounts-prices-api.wildberries.ru/api/v2/upload/task"

        data = {
            "data": param["data"]
        } # List[dict]  где dict {"nmID": int, "price": int, "discount": int}
        view = "post"

    if param["type"] == "get_question":
        # Метод предоставляет список вопросов по заданным фильтрам.
        # Можно получить максимум 10 000 вопросов в одном ответе
        # Максимум 1 запрос в секунду
        # Если превысить лимит в 3 запроса в секунду, отправка запросов будет заблокирована на 60 секунд

        API_URL = "https://feedbacks-api.wildberries.ru/api/v1/questions"
        params = {
            "isAnswered": param["isAnswered"], # bool отвеченные (True)
            "take": param.get("take", 10000), # Количество запрашиваемых вопросов (максимально допустимое значение для параметра - 10 000, при этом сумма значений параметров take и skip не должна превышать 10 000)
            "skip": param.get("skip", 0), # Количество вопросов для пропуска (максимально допустимое значение для параметра - 10 000, при этом сумма значений параметров take и skip не должна превышать 10 000)
        }
        view = "get"


    headers = {
        "Authorization": f"Bearer {param['API_KEY']}"  # Или просто API_KEY, если нужно
    }

    if view == 'get':
        async with session.get(API_URL, headers=headers, params=params, timeout=60, ssl=False) as response:
            if param["type"] == "seller_analytics_report":
                try:
                    content = await response.read()
                    return content
                except Exception as e:
                    return e
            response_text = await response.text()
            try:
                response.raise_for_status()
                return json.loads(response_text)
            except Exception as e:
                logger.error(
                    f"Ошибка в wb_api (get запрос): {e}. Ответ: {response_text}. Параметры: {param}"
                )
                return None

    if view == 'post':
        async with session.post(API_URL, headers=headers, params=params, json=data, timeout=60,
                                ssl=False) as response:
            response_text = await response.text()
            try:
                response.raise_for_status()
                return json.loads(response_text)
            except Exception as e:
                logger.error(
                    f"Ошибка в wb_api (post запрос): {e}.  Ответ: {response_text}. Параметры: {param}"
                )
                return None


async def get_orders():
    cabinets = await get_data_from_db("wb_wblk", ["id", "name", "token"], conditions={'groups_id': 1})
    for cab in cabinets:
        async with aiohttp.ClientSession() as session:
            date_from = (datetime.now() + timedelta(hours=3) - timedelta(days=14)).replace(hour=0, minute=0, second=0, microsecond=0)
            param = {
                "type": "orders",
                "API_KEY": cab["token"],
                "date_from": str(date_from),
                "flag": 0
            }
            response = await wb_api(session, param)
            conn = await async_connect_to_database()
            if not conn:
                logger.warning("Ошибка подключения к БД")
                raise
            try:
                for order in response:
                    await add_set_data_from_db(
                        conn=conn,
                        table_name="wb_orders",
                        data=dict(
                            lk_id=cab["id"],
                            date=parse_datetime(order["date"]),
                            lastchangedate=parse_datetime(order["lastChangeDate"]),
                            warehousename=order["warehouseName"].replace("Виртуальный ", "") if order["warehouseName"].startswith("Виртуальный") else order["warehouseName"],
                            warehousetype=order["warehouseType"],
                            countryname=order["countryName"],
                            oblastokrugname=order["oblastOkrugName"],
                            regionname=order["regionName"],
                            supplierarticle=order["supplierArticle"],
                            nmid=order["nmId"],
                            barcode=int(order["barcode"]) if order.get("barcode") else None,
                            category=order["category"],
                            subject=order["subject"],
                            brand=order["brand"],
                            techsize=order["techSize"],
                            incomeid=order["incomeID"],
                            issupply=order["isSupply"],
                            isrealization=order["isRealization"],
                            totalprice=order["totalPrice"],
                            discountpercent=order["discountPercent"],
                            spp=order["spp"],
                            finishedprice=float(order["finishedPrice"]),
                            pricewithdisc=float(order["priceWithDisc"]),
                            iscancel=order["isCancel"],
                            canceldate=parse_datetime(order["cancelDate"]),
                            sticker=order["sticker"],
                            gnumber=order["gNumber"],
                            srid=order["srid"],
                        ),
                        conflict_fields=['nmid', 'lk_id', 'srid']
                    )
            except Exception as e:
                logger.error(f"Ошибка при добавлении заказов в БД. Error: {e}")
            finally:
                await conn.close()


async def get_nmids():
    # получаем все карточки товаров
    cabinets = await get_data_from_db("wb_wblk", ["id", "name", "token"], conditions={'groups_id': 1})

    for cab in cabinets:
        async with aiohttp.ClientSession() as session:
            param = {
                "type": "get_nmids",
                "API_KEY": cab["token"],
            }
            while True:
                response = await wb_api(session, param)
                if not response.get("cards"):
                    logger.error(f"Ошибка при получении артикулов: {response}")
                    raise
                conn = await async_connect_to_database()
                if not conn:
                    logger.error("Ошибка подключения к БД")
                    raise
                try:
                    for resp in response["cards"]:
                        await add_set_data_from_db(
                            conn=conn,
                            table_name="wb_nmids",
                            data=dict(
                                lk_id=cab["id"],
                                nmid=resp["nmID"],
                                imtid=resp["imtID"],
                                nmuuid=resp["nmUUID"],
                                subjectid=resp["subjectID"],
                                subjectname=resp["subjectName"],
                                vendorcode=resp["vendorCode"],
                                brand=resp["brand"],
                                title=resp["title"],
                                description=resp["description"],
                                needkiz=resp["needKiz"],
                                dimensions=json.dumps(resp["dimensions"]),
                                characteristics=json.dumps(resp["characteristics"]),
                                sizes=json.dumps(resp["sizes"]),
                                tag_ids = json.dumps([]),
                                created_at=parse_datetime(resp["createdAt"]),
                                updated_at=parse_datetime(resp["updatedAt"]),
                                added_db=datetime.now() + timedelta(hours=3)
                            ),
                            conflict_fields=["nmid", "lk_id"]
                        )
                except Exception as e:
                    logger.error(f"Ошибка при добавлении артикулов в бд {e}")
                    raise
                finally:
                    await conn.close()


                if response["cursor"]["total"] < 100:
                    break
                else:
                    param["updatedAt"] = response["cursor"]["updatedAt"]
                    param["nmID"] = response["cursor"]["nmID"]


async def get_stocks_data_2_weeks():
    cabinets = await get_data_from_db("wb_wblk", ["id", "name", "token"], conditions={'groups_id': 1})

    for cab in cabinets:
        async with aiohttp.ClientSession() as session:
            param = {
                "type": "get_stocks_data",
                "API_KEY": cab["token"],
                "dateFrom": str(datetime.now() + timedelta(hours=3) - timedelta(days=1)), #вчерашний день с текущим временем
            }
            response = await wb_api(session, param)

            conn = await async_connect_to_database()
            if not conn:
                logger.error("Ошибка подключения к БД")
                raise
            try:
                for quant in response:
                    await add_set_data_from_db(
                        conn=conn,
                        table_name="wb_stocks",
                        data=dict(
                            lk_id=cab["id"],
                            lastchangedate=parse_datetime(quant["lastChangeDate"]),
                            warehousename=quant["warehouseName"],
                            supplierarticle=quant["supplierArticle"],
                            nmid=quant["nmId"],
                            barcode=int(quant["barcode"]) if quant.get("barcode") else None,
                            quantity=quant["quantity"],
                            inwaytoclient=quant["inWayToClient"],
                            inwayfromclient=quant["inWayFromClient"],
                            quantityfull=quant["quantityFull"],
                            category=quant["category"],
                            techsize=quant["techSize"],
                            issupply=quant["isSupply"],
                            isrealization=quant["isRealization"],
                            sccode=quant["SCCode"],
                            added_db=datetime.now() + timedelta(hours=3)

                        ),
                        conflict_fields=['nmid', 'lk_id', 'supplierarticle', 'warehousename']
                    )
            except Exception as e:
                logger.error(f"Ошибка при добавлении остатков в БД. Error: {e}")
            finally:
                await conn.close()